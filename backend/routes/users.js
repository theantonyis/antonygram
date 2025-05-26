import mongoose from 'mongoose';
import express from 'express';
import auth from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Message } from '../models/Message.js';

const router = express.Router();

// Route to update username
router.put('/update-username', auth, async (req, res) => {
    const { username } = req.body;
    const currentUsername = req.user.username;

    // Input validation
    if (!username || username.trim().length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters long' });
    }

    // Check if new username already exists
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Update the user's username
            const updatedUser = await User.findOneAndUpdate(
                { username: currentUsername },
                { username },
                { new: true, session }
            );

            if (!updatedUser) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ message: 'User not found' });
            }

            // Update username references in other users' contacts
            await User.updateMany(
                { contacts: currentUsername },
                { $set: { "contacts.$[elem]": username } },
                { arrayFilters: [{ elem: currentUsername }], session }
            );

            // Update username references in messages (from field)
            await Message.updateMany(
                { from: currentUsername },
                { $set: { from: username } },
                { session }
            );

            // Update username references in messages (to field)
            await Message.updateMany(
                { to: currentUsername },
                { $set: { to: username } },
                { session }
            );

            // Commit transaction
            await session.commitTransaction();
            session.endSession();

            res.status(200).json({
                message: 'Username updated successfully',
                user: updatedUser
            });
        } catch (error) {
            // Roll back transaction if an error occurs
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (err) {
        console.error('Error updating username:', err);
        res.status(500).json({ message: 'Failed to update username' });
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

export default router;
