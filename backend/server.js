import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import contactsRoutes from './routes/contacts.js';
import { connectToDB } from './services/db.js';
import { initSocket } from './services/socket.js';

dotenv.config();

const app = express();
app.use(cors({origin: process.env.CLIENT_URL ||'*'}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contacts', contactsRoutes);

connectToDB();

const server = http.createServer(app);
const io = initSocket(server, {
    cors: {
        origin: process.env.CLIENT_URL ||'*',
        methods: ["GET", "POST"],
        credentials: true,
    }

});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
