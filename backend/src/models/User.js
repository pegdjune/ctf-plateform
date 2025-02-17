const mongoose = require('mongoose');

// Define User schema with authentication and progress tracking fields
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    progress: {
        completedChallenges: [String],
        points: { type: Number, default: 0 }
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('User', userSchema);
module.exports = User;