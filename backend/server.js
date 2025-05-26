import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import path from "path";
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import contactsRoutes from './routes/contacts.js';
import groupsRoutes from './routes/groups.js';
import filesRoutes from "./routes/files.js";
import usersRoutes from './routes/users.js';
import { connectToDB } from './services/db.js';
import { initSocket } from './services/socket.js';

dotenv.config();

const allowedOrigins = [
    'https://antonygram.vercel.app',
    'http://localhost:3000'
];


const app = express();
app.use(cors({origin: allowedOrigins, credentials: true}));
app.use(express.json());
app.use('/uploads', express.static(path.resolve('./uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/users', usersRoutes);

connectToDB();

const server = http.createServer(app);
const io = initSocket(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
    }

});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
