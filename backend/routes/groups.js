import express from 'express';
const router = express.Router();
import { Group } from '../models/Group.js';

// Create a new group
router.post('/', async (req, res) => {
    try {
        const { name, members } = req.body;
        const group = new Group({ name, members });
        await group.save();
        res.status(201).json(group);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all groups
router.get('/', async (req, res) => {
    const groups = await Group.find().populate('members', 'username email');
    res.json(groups);
});

// Add more routes as needed (add member, remove member, get group by ID, etc.)

export default router;
