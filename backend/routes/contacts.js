import express from 'express';
const router = express.Router();
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';

// ✅ GET /api/contacts
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({ username: { $ne: req.user.username } }).select('username');
        res.json({ contacts: users.map(u => u.username) });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
