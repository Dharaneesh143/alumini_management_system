const mongoose = require('mongoose');

const MentorshipSchema = new mongoose.Schema({
    student_id: { // Explicit mapping from request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentor_id: { // Explicit mapping from request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    alumni: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'removed', 'completed', 'Pending', 'Active', 'Completed'],
        default: 'pending'
    },
    start_date: Date,
    end_date: Date,
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

// Pre-validate to sync fields before Mongoose validation
MentorshipSchema.pre('validate', function () {
    if (this.student_id && !this.student) this.student = this.student_id;
    else if (this.student && !this.student_id) this.student_id = this.student;

    if (this.mentor_id && !this.alumni) this.alumni = this.mentor_id;
    else if (this.alumni && !this.mentor_id) this.mentor_id = this.alumni;

    if (this.status === 'Active' || this.status === 'accepted') {
        this.status = 'Active';
    } else if (this.status === 'Completed' || this.status === 'completed') {
        this.status = 'Completed';
    } else if (this.status === 'Pending' || this.status === 'pending') {
        this.status = 'Pending';
    }
});

module.exports = mongoose.model('Mentorship', MentorshipSchema);
