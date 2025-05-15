import mongoose from 'mongoose';

// Define the schema for the Message model
const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
