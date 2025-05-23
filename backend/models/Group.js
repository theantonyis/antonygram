import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    avatar: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});

export const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
