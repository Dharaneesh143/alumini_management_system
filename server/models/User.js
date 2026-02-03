const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['student', 'alumni', 'admin'],
        default: 'student'
    },
    isVerified: {
        type: Boolean,
        default: false // Alumni need admin verification
    },
    // Extended Profile Data (Optional/role-specific, but keeping common fields here for simplicity or creating separate Profile model)
    // For now, storing core profile data here to simplify initial networking
    profile: {
        department: String,
        batch: String, // Year
        company: String,
        designation: String,
        skills: [String],
        linkedin: String,
        github: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
