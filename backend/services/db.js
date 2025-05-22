import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';

dotenv.config();
const dbURI = process.env.MONGODB_URI;

export const connectToDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB Atlas');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

export const getMessages = async () => {
  return await Message.find().sort({ timestamp: 1 });
};

export const getMessagesBetween = async (user1, user2) => {
  return await Message.find({
    $or: [
      { from: user1, to: user2 },
      { from: user2, to: user1 }
    ]
  }).sort({ timestamp: 1 });
};

export const addMessage = async (text, from, to) => {
  const msg = new Message({ text, from, to });
  return msg.save();
};

export const isUserExist = async (username) => {
  try {
    const user = await User.findOne({ username });
    return user !== null;
  } catch (err) {
    console.error('Error checking if user exists:', err);
    throw err;  // rethrow so caller knows
  }
};

export const addUser = async (user) => {
  try {
    const salt = crypto.randomBytes(16).toString('hex');
    const password = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
    const newUser = new User({ username: user.username, password, salt });
    await newUser.save();
  } catch (err) {
    console.error('Error adding user:', err);
    throw err;  // rethrow
  }
};

export const clearChat = async () => {
  try {
    await Message.deleteMany({});
  } catch (err) {
    console.error('Error clearing chat:', err);
  }
};
