import mongoose from 'mongoose';

// Define the schema for the Message model
const MessageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
