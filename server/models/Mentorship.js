const mongoose = require('mongoose');

const MentorshipSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    alumni: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'removed'],
        default: 'pending'
    },
    message: {
        type: String,
        required: true
    },
    mentorshipTopic: {
        type: String,
        required: true
    },
    resumeUrl: {
        type: String
    },
    response: {
        type: String
    },
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        text: {
            type: String
        },
        type: {
            type: String,
            enum: ['text', 'image', 'voice', 'file'],
            default: 'text'
        },
        fileUrl: {
            type: String
        },
        fileName: {
            type: String
        },
        transcription: {
            type: String
        },
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isMutedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isArchivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    mentorNotes: [{
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Mentorship', MentorshipSchema);
