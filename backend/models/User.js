    import mongoose from 'mongoose';

    // Define the schema for the User model
    const userSchema = new mongoose.Schema({
        username: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        salt: { type: String, required: true },
        contacts: [{ type: String }],
        avatar: String,
        lastSeen: {
            type: Date,
            default: Date.now,
        }
    });

    // Check if the model is already compiled to avoid overwriting
    export const User = mongoose.models.User || mongoose.model('User', userSchema);
