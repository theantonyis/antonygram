// socket.js
import jwt from 'jsonwebtoken';
import {Message} from '../models/Message.js';
import { Server } from'socket.io';
import {User} from "../models/User.js";
import { Group } from "../models/Group.js";

export const onlineUsers = new Map();

export const initSocket = async (server, ioOptions) => {
    const io = new Server(server, ioOptions);

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("No token"));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.username = decoded.username;
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ ${socket.username} connected`);

        onlineUsers.set(socket.username, socket);

        const onlineUsernames = Array.from(onlineUsers.keys());
        io.emit('online_users', onlineUsernames);

        socket.on('joinRoom', ({ withUser }) => {
            const roomName = [socket.username, withUser].sort().join('_');
            socket.join(roomName);
            console.log(`${socket.username} joined room ${roomName}`);
        });

        socket.on('joinGroup', async ({ groupId }) => {
            if (groupId) {
                socket.join(groupId);
                try {
                    const group = await Group.findById(groupId);
                    const groupName = group ? group.name : '[Unknown Group]';
                    console.log(`${socket.username} joined group "${groupName}" (${groupId})`);
                } catch (err) {
                    console.log(`${socket.username} joined group (failed to fetch name) (${groupId})`);
                }
            }
        });

        socket.on('message', async (message) => {
            const { to, text, replyTo, isGroup, clientId, file } = message;

            console.log('Message received:', { to, hasText: !!text, hasFile: !!file });

            if (!to || (!text && !file)) return;

            // Get sender doc for avatar
            const senderUser = await User.findOne({ username: socket.username });

            const newMessage = await Message.create({
                from: socket.username,
                to,
                text: text || '',
                replyTo: replyTo || null,
                clientId,
                file,
                isGroup: isGroup || false
            });

            const messageData = {
                _id: newMessage._id,
                from: socket.username,
                to,
                text: text || '',
                timestamp: newMessage.timestamp,
                senderAvatar: senderUser?.avatar || '',
                replyTo: newMessage.replyTo,
                clientId: clientId,
                isGroup: isGroup || false,
                file: file
            };

            if (isGroup) {
                io.to(to).emit('message', messageData); // to = groupId
            } else {
                const roomName = [socket.username, to].sort().join('_');
                io.to(roomName).emit('message', messageData);
            }
        });

        socket.on('deleteMessage', async ({ messageId, clientId, to, isGroup }) => {
            // Mark the message as deleted in DB
            await Message.findByIdAndUpdate(messageId, { deleted: true });

            // Prepare the payload
            const payload = { messageId, clientId, from: socket.username, to, isGroup: true };

            // Emit to the correct room/group
            if (isGroup) {
                io.to(to).emit('messageDeleted', payload);
            } else {
                const roomName = [socket.username, to].sort().join('_');
                io.to(roomName).emit('messageDeleted', payload);
            }
        });

        socket.on('disconnect', async() => {
            console.log(`❌ ${socket.username} disconnected`);
            if (socket.username) {
                onlineUsers.delete(socket.username);

                await User.findOneAndUpdate(
                    { username: socket.username },
                    { lastSeen: new Date() }
                );

                // Broadcast updated online users
                const onlineUsernames = Array.from(onlineUsers.keys());
                io.emit('online_users', onlineUsernames);
            }
        });
    });

    return io;
};
