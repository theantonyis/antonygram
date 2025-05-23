import express from 'express';
const router = express.Router();
import { Group } from '../models/Group.js';
import auth from '../middleware/auth.js';
import { User } from '../models/User.js';

// Create a new group
router.post('/', async (req, res) => {
    try {
        let { name, members,avatar } = req.body;

        if (typeof members === 'string') members = [members]; // Single member selected
        if (!members) members = [];

        const group = new Group({ name, members, avatar });
        await group.save();
        res.status(201).json(group);
    } catch (err) {
        console.error('Create group error:', err);
        res.status(400).json({ error: err.message });
    }
});

// Get all groups
router.get('/', auth, async (req, res) => {
    const userId = req.user.id;
    const groups = await Group.find({members: userId}).populate('members', 'username email');
    res.json(groups);
});

router.get('/:groupId', auth, async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId).populate('members', 'username email avatar');
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        res.json(group);
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.post('/:groupId/add-member', auth, async (req, res) => {
    const { username } = req.body;
    const { groupId } = req.params;

    try {
        const userToAdd = await User.findOne({ username });
        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Prevent duplicate members
        if (group.members.some(memberId => memberId.equals(userToAdd._id))) {
            return res.status(400).json({ error: 'User is already a group member' });
        }

        group.members.push(userToAdd._id);
        await group.save();

        // Return updated group with populated members
        const updatedGroup = await Group.findById(groupId).populate('members', 'username email avatar');
        res.json({ success: true, group: updatedGroup });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.post('/:groupId/remove-member', auth, async (req, res) => {
    const { username } = req.body;
    const { groupId } = req.params;

    try {
        const userToRemove = await User.findOne({ username });
        if (!userToRemove) {
            return res.status(404).json({ error: 'User not found' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the user is a member of the group
        if (!group.members.some(memberId => memberId.equals(userToRemove._id))) {
            return res.status(400).json({ error: 'User is not a group member' });
        }

        group.members = group.members.filter(memberId => !memberId.equals(userToRemove._id));
        await group.save();

        // Return updated group with populated members
        const updatedGroup = await Group.findById(groupId).populate('members', 'username email avatar');
        res.json({ success: true, group: updatedGroup });
    } catch (err) {
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// DELETE a group
router.delete('/:groupId', auth, async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Optional: ensure the user is a member or admin before deleting
        if (!group.members.some(memberId => memberId.equals(req.user.id))) {
            return res.status(403).json({ error: 'Not authorized to delete this group' });
        }

        await Group.deleteOne({ _id: groupId });

        res.json({ success: true, message: 'Group deleted successfully' });
    } catch (err) {
        console.error('Delete group error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});


export default router;
