// pages/api/register.js
import db from '../../utils/db';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).json({ message: 'Empty login or password' });
        }

        try {
            const userExists = await db.isUserExist(login);
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const newUser = await db.addUser({ login, password });
            res.status(200).json({ message: 'Registration successful!' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}
