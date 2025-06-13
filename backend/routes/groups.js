import express from 'express';
const router = express.Router();
import { Group } from '../models/Group.js';
import auth from '../middleware/auth.js';
import { User } from '../models/User.js';

// Create a new group
router.post('/', auth, async (req, res) => {
    try {
        let { name, members, avatar } = req.body;

        // Ensure members is an array and filter out null/undefined values
        if (typeof members === 'string') {
            members = [members]; // Single member selected
        } else if (!Array.isArray(members)) {
            members = [];
        }

        // Filter out null, undefined or invalid values
        members = members.filter(member => member);

        // Always add the current user creating the group as a member
        const userId = req.user.userId;

        // Add current user only if not already in the list
        const userAlreadyIncluded = members.some(memberId =>
                memberId && (
                    memberId === userId ||
                    memberId.toString() === userId
                )
        );

        if (!userAlreadyIncluded) {
            members.push(userId);
        }

        const group = new Group({
            name,
            members,
            avatar,
            creator: userId
        });

        await group.save();

        // Return the populated group to the client
        const populatedGroup = await Group.findById(group._id)
            .populate('members', 'username email avatar')
            .populate('creator', 'username email avatar');

        res.status(201).json(populatedGroup);
    } catch (err) {
        console.error('Create group error:', err);
        res.status(400).json({ error: err.message });
    }
});

// Get all groups
router.get('/', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const groups = await Group.find({members: userId})
            .populate('members', 'username email avatar')
            .populate('creator', 'username email avatar');
        res.json(groups);
    } catch (err) {
        console.error('Get groups error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

router.get('/:groupId', auth, async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findById(groupId)
            .populate('members', 'username email avatar')
            .populate('creator', 'username email avatar');
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
        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const userToAdd = await User.findOne({ username: username.trim() });
        if (!userToAdd) {
            return res.status(404).json({ error: 'User not found' });
        }

        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Prevent duplicate members - safely check with proper null handling
        if (group.members && group.members.some(memberId =>
            memberId && userToAdd._id && memberId.equals(userToAdd._id))) {
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

        // Check if the user is a member of the group - with null checking
        const isMember = group.members && group.members.some(memberId =>
            memberId && userToRemove._id && memberId.equals(userToRemove._id)
        );

        if (!isMember) {
            return res.status(400).json({ error: 'User is not a group member' });
        }

        group.members = group.members.filter(memberId =>
            memberId && userToRemove._id && !memberId.equals(userToRemove._id)
        );
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
    const userId = req.user.userId;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Check if the user is the creator
        if (group.creator && group.creator.toString() !== userId) {
            return res.status(403).json({ error: 'Only the group creator can delete this group' });
        }

        await Group.deleteOne({ _id: groupId });
        res.json({ success: true, message: 'Group deleted successfully' });
    } catch (err) {
        console.error('Delete group error:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});


export default router;
