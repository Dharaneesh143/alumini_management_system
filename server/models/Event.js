const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Alumni Meet', 'Webinar', 'Workshop', 'Guest Lecture', 'Other'],
        default: 'Webinar'
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true // Can be a physical location or an online link
    },
    speaker: {
        name: { type: String, required: true },
        alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // If the speaker is an alumni
    },
    department: {
        type: String,
        required: true
    },
    maxParticipants: {
        type: Number,
        default: 100
    },
    registeredParticipants: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['student', 'alumni'] },
        registeredAt: { type: Date, default: Date.now }
    }],
    presentations: [{
        fileName: String,
        fileUrl: String,
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        uploadedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed'],
        default: 'Upcoming'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    feedback: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
