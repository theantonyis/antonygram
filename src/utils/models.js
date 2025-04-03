const mongoose = require('mongoose');

// Define the schema for the Message model
const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
});

// Define the schema for the User model
const userSchema = new mongoose.Schema({
    login: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    salt: { type: String, required: true }
});

// Check if the model is already compiled to avoid overwriting
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

// Export the models for use in other files
module.exports = { User, Message };
