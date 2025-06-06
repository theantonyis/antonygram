import express from 'express';
const router = express.Router();
import { User } from '../models/User.js';
import auth from '../middleware/auth.js';
import { onlineUsers } from '../services/socket.js';

// ✅ GET /api/contacts
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findOne({ username: req.user.username });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Підвантажуємо інформацію по контактах
        const contacts = await User.find({ username: { $in: user.contacts } })
            .select('username avatar lastSeen');

        // Додаємо поле "online" із onlineUsers Map
        const enrichedContacts = contacts.map(contact => ({
            _id: contact._id,
            username: contact.username,
            avatar: contact.avatar,
            lastSeen: contact.lastSeen,
            online: onlineUsers.has(contact.username)
        }));

        res.json({ contacts: enrichedContacts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add contact by username
router.post('/add', auth, async (req, res) => {
    const { username } = req.body;

    if (username === req.user.username)
        return res.status(400).json({ error: "You can't add yourself." });

    try {
        const contactUser = await User.findOne({ username });
        if (!contactUser)
            return res.status(404).json({ error: 'User not found' });

        const user = await User.findOne({ username: req.user.username });

        if (user.contacts.includes(username))
            return res.status(400).json({ error: 'Contact already exists' });

        user.contacts.push(username);
        await user.save();

        // Fetch full info of all contacts, similar to GET /api/contacts
        const contacts = await User.find({ username: { $in: user.contacts } })
            .select('username avatar lastSeen');

        const enrichedContacts = contacts.map(contact => ({
            _id: contact._id,
            username: contact.username,
            avatar: contact.avatar,
            lastSeen: contact.lastSeen,
            online: onlineUsers.has(contact.username)
        }));

        res.json({
            success: true,
            message: 'Contact added',
            contacts: enrichedContacts
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Search users by partial name
router.get('/search', auth, async (req, res) => {
    const query = req.query.q;

    if (!query) return res.status(400).json({ error: 'No search query provided' });

    try {
        const user = await User.findOne({ username: req.user.username });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const excludedUsernames = [req.user.username, ...user.contacts];

        const results = await User.find({
            username: {
                $regex: query,
                $options: 'i',
                $nin: excludedUsernames
            }
        }).select('username avatar');

        res.json({
            users: results.map(u => ({
                _id: u._id,
                username: u.username,
                avatar: u.avatar || null
            }))
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/contacts/:username
router.delete('/:username', auth, async (req, res) => {
    const contactUsername = req.params.username;

    if (contactUsername === req.user.username)
        return res.status(400).json({ error: "You can't remove yourself." });

    try {
        const user = await User.findOne({ username: req.user.username });

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (!user.contacts.includes(contactUsername))
            return res.status(404).json({ error: 'Contact not found' });

        user.contacts = user.contacts.filter(username => username !== contactUsername);
        await user.save();

        // Fetch full contact data for the remaining contacts
        const contacts = await User.find({ username: { $in: user.contacts } })
            .select('username avatar lastSeen');
        const enrichedContacts = contacts.map(contact => ({
            _id: contact._id,
            username: contact.username,
            avatar: contact.avatar,
            lastSeen: contact.lastSeen,
            online: onlineUsers.has(contact.username)
        }));
        res.json({ success: true, message: 'Contact removed', contacts: enrichedContacts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


export default router;
