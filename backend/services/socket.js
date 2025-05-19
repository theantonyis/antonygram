// socket.js
import jwt from 'jsonwebtoken';
import {Message} from '../models/Message.js';
import { Server } from'socket.io';
import {User} from "../models/User.js";

const onlineUsers = new Map();

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

        socket.on('joinRoom', ({ withUser }) => {
            const roomName = [socket.username, withUser].sort().join('_');
            socket.join(roomName);
            console.log(`${socket.username} joined room ${roomName}`);
        });

        socket.on('message', async ({ to, text }) => {
            if (!to || !text) return;

            const newMessage = await Message.create({
                from: socket.username,
                to,
                text,
            });

            const messageData = {
                from: socket.username,
                to,
                text,
                timestamp: newMessage.timestamp,
            };

            const roomName = [socket.username, to].sort().join('_');
            io.to(roomName).emit('message', messageData);
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
