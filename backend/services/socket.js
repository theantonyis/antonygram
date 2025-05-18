// socket.js
import jwt from 'jsonwebtoken';
import {Message} from '../models/Message.js';
import { Server } from'socket.io';

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

        socket.on('message', async ({ to, text }) => {
            if (!to || !text) return;

            const newMessage = await Message.create({
                from: socket.username,
                to,
                text,
            });

            // Emit message to recipient if online
            const targetSocket = onlineUsers.get(to);
            if (targetSocket) {
                targetSocket.emit('message', {
                    from: socket.username,
                    to,
                    text,
                    timestamp: newMessage.timestamp,
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ ${socket.username} disconnected`);
            onlineUsers.delete(socket.username);
        });
    });

    return io;
};
