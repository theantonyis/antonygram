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
    const { from, to, text } = req.body;
    if (!from || !to || !text) {
        return res.status(400).json({ message: 'Missing from, to or text' });
    }

    try {
        const newMessage = new Message({ from, to, text });
        await newMessage.save();
        res.status(201).json(newMessage);
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

// DELETE messages between current user and a contact
router.delete('/:contactUsername', auth, async (req, res) => {
    const current = req.user.username;
    const contact = req.params.contactUsername;

    try {
        // Delete all messages where (from == current && to == contact) OR (from == contact && to == current)
        await Message.deleteMany({
            $or: [
                { from: current, to: contact },
                { from: contact, to: current },
            ],
        });

        res.status(200).json({ message: 'Chat cleared successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to clear chat' });
    }
});


export default router;
