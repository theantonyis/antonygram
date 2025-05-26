import mongoose from 'mongoose';

// Define the schema for the Message model
const MessageSchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    text: { type: String, required: false },
    timestamp: { type: Date, default: Date.now },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: false,
    },
    deleted: { type: Boolean, default: false },
    file: {
        url: { type: String, required: false },
        name: { type: String, required: false },
        size: { type: Number, required: false },
        type: { type: String, required: false },
    },
    clientId: { type: String },
    isGroup: { type: Boolean, default: false },
});

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
