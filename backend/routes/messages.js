import express from 'express';
import { getMessages, addMessage, clearChat, getMessagesBetween } from '../services/db.js';
import auth from '../middleware/auth.js';
import {Message} from "../models/Message.js";
// ...other imports above

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
        })
        .sort({ timestamp: 1 })
        .populate('replyTo', 'from text senderAvatar');

        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// POST a new message
router.post('/', async (req, res) => {
    const { from, to, text, replyTo } = req.body;
    if (!from || !to || !text) {
        return res.status(400).json({ message: 'Missing from, to or text' });
    }

    try {
        const messageData = {from, to, text};
        if (replyTo) messageData.replyTo = replyTo;

        const newMessage = new Message(messageData);
        await newMessage.save();

        await newMessage.populate('replyTo', 'from text senderAvatar');

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: 'Failed to post message' });
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

// DELETE a single message by ID (authenticated)
router.delete('/single/:messageId', auth, async (req, res) => {
    const messageId = req.params.messageId;
    const current = req.user.username;

    try {
        // Only allow deletion if the message belongs to the current user
        const msg = await Message.findById(messageId);
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        if (msg.from !== current) {
            return res.status(403).json({ message: 'You can only delete your own messages' });
        }

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete message' });
    }
});

export default router;
