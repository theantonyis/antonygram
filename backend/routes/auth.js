import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { isUserExist, addUser } from '../services/db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body);  // Log request body
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
        if (hashedPassword !== user.password)
            return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ message: 'Empty login or password' });

    try {
        const exists = await isUserExist(username);
        if (exists) return res.status(400).json({ message: 'User already exists' });

        await addUser({ username, password });
        res.status(200).json({ message: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
