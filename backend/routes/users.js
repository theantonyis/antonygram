import mongoose from 'mongoose';
import express from 'express';
import auth from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';

const router = express.Router();

router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password -salt');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/update-profile', auth, async (req, res) => {
    const { name, surname, avatarUrl } = req.body;
    const currentUsername = req.user.username;

    if (name && name.trim().length === 0) {
        return res.status(400).json({ message: 'Name cannot be empty' });
    }

    const updateFields = {};

    if (name) updateFields.name = name;
    if (surname !== undefined) updateFields.surname = surname;
    if (avatarUrl) updateFields.avatar = avatarUrl;

    try {
        // Update the user's profile
        const updatedUser = await User.findOneAndUpdate(
            { username: currentUsername },
            updateFields,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

router.put('/avatar', auth, async (req, res) => {
    try {
        const { avatarUrl, blobName } = req.body;

        if (!avatarUrl) {
            return res.status(400).json({ message: 'Avatar URL is required' });
        }

        // Update the avatar URL
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { avatar: avatarUrl },
            { new: true, select: '-password -salt' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Avatar updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Error updating avatar:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;

        if (!searchQuery || searchQuery.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        // Search by username, name, or surname (case insensitive)
        const users = await User.find({
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { name: { $regex: searchQuery, $options: 'i' } },
                { surname: { $regex: searchQuery, $options: 'i' } }
            ]
        }).select('username name surname avatar').limit(10);

        return res.json({ users });
    } catch (error) {
        console.error('User search error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

export default router;
