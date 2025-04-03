// const express = require('express');
// const next = require('next');
// const http = require('http');
// const { Server } = require('socket.io');
// const cookie = require('cookie');
// const jwt = require('jsonwebtoken');
// const db = require('./src/utils/db');
// const { Message, User } = require('./src/utils/models');
//
// const dev = process.env.NODE_ENV !== 'production';
// const app = next({ dev });
// const handle = app.getRequestHandler();
// const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',  // Allow requests from localhost:3000
//     methods: ['GET', 'POST'],  // Allow GET and POST methods
//   },
// });
//
// app.prepare().then(() => {
//   const expressApp = express();
//
//   // Middleware for parsing JSON requests
//   expressApp.use(express.json());
//   expressApp.use(express.urlencoded({ extended: true }));
//
//   // Helper function to get credentials from cookies
//   function getCredentials(c = '') {
//     const cookies = cookie.parse(c);
//     const token = cookies?.token;
//     if (!token) return null;
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       return decoded;
//     } catch (err) {
//       return null;
//     }
//   }
//
//   // Serve static files from the 'public' directory
//   expressApp.use(express.static('public'));
//
//   // API routes handled by Next.js will be in the 'pages/api' directory
//
//   // WebSocket configuration
//   io.use((socket, next) => {
//     const cookieHeader = socket.handshake.auth?.cookie;
//     const credentials = getCredentials(cookieHeader);
//     if (!credentials) {
//       return next(new Error('No auth'));
//     }
//     socket.credentials = credentials;
//     next();
//   });
//
//   io.on('connection', async (socket) => {
//     console.log(`User connected: ${socket.id}`);
//
//     const { login: userNickname, user_id: userId } = socket.credentials;
//
//     try {
//       const messages = await Message.find().populate('author', 'login').exec();
//       socket.emit('all_messages', messages.map(msg => ({
//         login: msg.author.login,
//         message: msg.content,
//         timestamp: msg.timestamp,
//       })));
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     }
//
//     socket.on('new_message', async (newMessage) => {
//       if (!newMessage || !newMessage.message) {
//         return;
//       }
//
//       try {
//         const savedMessage = await db.addMessage(newMessage.message, userId);
//         io.emit('message', {
//           login: userNickname,
//           message: savedMessage.message,
//           timestamp: savedMessage.timestamp,
//         });
//       } catch (error) {
//         console.error('Error saving message:', error);
//       }
//     });
//
//     if (userNickname === 'antony') {
//       socket.on('clear_messages', async () => {
//         await db.clearChat();
//         io.emit('clear_messages');
//         console.log('Chat cleared.');
//       });
//     }
//
//     socket.on('disconnect', () => {
//       console.log(`User disconnected: ${socket.id}`);
//     });
//   });
//
//   // Handle all other routes using Next.js
//   expressApp.all('*', (req, res) => {
//     return handle(req, res);
//   });
//
//   const PORT = process.env.PORT || 5000;
//   server.listen(PORT, (err) => {
//     if (err) throw err;
//     console.log(`Server is running on http://localhost:${PORT}`);
//   });
// });
//
