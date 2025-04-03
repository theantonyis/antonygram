const mongoose = require('mongoose');
const crypto = require('crypto');
const { Message, User } = require('./models');
const dotenv = require('dotenv');

dotenv.config();

// MongoDB connection URI (update this with your MongoDB Atlas URI)
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));

module.exports = {
  getMessages: async () => {
    try {
      return await Message.find().populate('author', 'login');
    } catch (dbError) {
      console.error('Error retrieving messages:', dbError);
    }
  },

  addMessage: async (msg, userId) => {
    try {
      const message = new Message({ content: msg, author: userId });
      await message.save();
    } catch (dbError) {
      console.error('Error adding message:', dbError);
    }
  },

  isUserExist: async (login) => {
    try {
      const user = await User.findOne({ login });
      return user !== null;
    } catch (dbError) {
      console.error('Error checking if user exists:', dbError);
    }
  },

  addUser: async (user) => {
    try {
      const salt = crypto.randomBytes(16).toString('hex');
      const password = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
      const newUser = new User({ login: user.login, password, salt });
      await newUser.save();
    } catch (dbError) {
      console.error('Error adding user:', dbError);
    }
  },

  getAuthToken: async (user) => {
    try {
      const candidate = await User.findOne({ login: user.login });
      if (!candidate) {
        throw 'Wrong login';
      }
      const { _id, login, password, salt } = candidate;
      const hash = crypto.pbkdf2Sync(user.password, salt, 1000, 64, 'sha512').toString('hex');
      if (password !== hash) {
        throw 'Wrong password';
      }
      return `${_id}.${login}.${crypto.randomBytes(20).toString('hex')}`;
    } catch (dbError) {
      console.error('Error generating auth token:', dbError);
      throw dbError;
    }
  },

  clearChat: async () => {
    try {
      await Message.deleteMany({});
    } catch (dbError) {
      console.error('Error clearing chat:', dbError);
    }
  }
};
