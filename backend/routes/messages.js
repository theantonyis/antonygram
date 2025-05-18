import express from 'express';
import { getMessages, addMessage, clearChat, getMessagesBetween } from '../services/db.js';
import auth from '../middleware/auth.js';
import {Message} from "../models/Message.js";

const router = express.Router();

// GET all messages
router.get('/', async (req, res) => {
    try {
        const messages = await getMessages();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// GET messages between two users
router.get('/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    try {
        const messages = await getMessagesBetween(user1, user2);
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch messages between users' });
    }
});

// ✅ GET /api/messages/:contactUsername
router.get('/:contactUsername', auth, async (req, res) => {
    const current = req.user.username;
    const contact = req.params.contactUsername;

    try {
        const messages = await Message.find({
            $or: [
                { from: current, to: contact },
                { from: contact, to: current },
            ],
        }).sort({ timestamp: 1 });

        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST a new message
router.post('/', async (req, res) => {
    const { content, userId } = req.body;
    if (!content || !userId) {
        return res.status(400).json({ message: 'Missing content or userId' });
    }

    try {
        await addMessage(content, userId);
        const messages = await getMessages(); // optionally return updated list
        res.status(201).json(messages[messages.length - 1]); // return the last message
    } catch (err) {
        res.status(500).json({ message: 'Failed to post message' });
    }
});

// DELETE all messages
router.delete('/', async (req, res) => {
    try {
        await clearChat();
        res.status(200).json({ message: 'All messages deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete messages' });
    }
});

export default router;
