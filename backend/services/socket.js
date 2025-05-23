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

        socket.on('message', async ({ to, text, replyTo, isGroup }) => {
            if (!to || !text) return;

            // Get sender doc for avatar
            const senderUser = await User.findOne({ username: socket.username });

            const newMessage = await Message.create({
                from: socket.username,
                to,
                text,
                replyTo: replyTo || null
            });

            const messageData = {
                from: socket.username,
                to,
                text,
                timestamp: newMessage.timestamp,
                senderAvatar: senderUser?.avatar || '',
                replyTo: newMessage.replyTo
            };

            if (isGroup) {
                io.to(to).emit('message', messageData); // to = groupId
            } else {
                const roomName = [socket.username, to].sort().join('_');
                io.to(roomName).emit('message', messageData);
            }
        });

        socket.on('disconnect', async() => {
            console.log(`❌ ${socket.username} disconnected`);
            if (socket.username) {
                onlineUsers.delete(socket.username);

                // ✅ Update lastSeen in DB
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
