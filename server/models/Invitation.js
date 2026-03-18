const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    alumniId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    invitedAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: Date
}, { timestamps: true });

// Ensure unique invitation per event per alumni
invitationSchema.index({ eventId: 1, alumniId: 1 }, { unique: true });

module.exports = mongoose.model('Invitation', invitationSchema);
