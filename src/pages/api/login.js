// pages/api/login.js
import db from '../../utils/db';
import { User } from '../../utils/models'; // Import User model
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        // Check if the username and password were provided
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        try {
            // Find the user in the database by username
            const user = await User.findOne({ login: username });

            // If user is not found, return an error
            if (!user) {
                return res.status(400).json({ message: 'User not found' });
            }

            // Hash the provided password with the user's salt
            const hashedPassword = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');

            // Compare the hashed password with the stored password
            if (hashedPassword !== user.password) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Create a JWT token
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Return the token and success message
            res.status(200).json({ message: 'Login successful', token });
        } catch (err) {
            console.error('Error during login:', err);
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        // Method not allowed for non-POST requests
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
