const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
    event_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registration_date: {
        type: Date,
        default: Date.now
    },
    attendance_status: {
        type: String,
        enum: ['Present', 'Absent', 'Pending'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
