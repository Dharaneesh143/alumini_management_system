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
        enum: ['Hackathon', 'Company', 'College Event', 'Other'],
        default: 'Other'
    },
    event_type: { // Explicit mapping from request
        type: String,
        enum: ['Hackathon', 'Company', 'College Event', 'Other']
    },
    date: {
        type: Date,
        required: false
    },
    event_date: Date, // Explicit mapping from request
    time: {
        type: String,
        required: false
    },
    venue: {
        type: String,
        required: false
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline'],
        default: 'Online'
    },
    organized_by: { // Admin / Alumni
        type: String,
        enum: ['Admin', 'Alumni']
    },
    organizer: String, // Company / Alumni Name
    duration: String,
    meetingLink: String, // Zoom/Meet
    imageUrl: String, // Poster image
    category: {
        type: String,
        enum: ['Farewell', 'Guest Lecture', 'Celebration', 'Technical', 'Career', 'Other'],
        default: 'Other'
    },
    registration_link: String, // Explicit mapping from request
    requestDetails: {
        message: String,
        preferredDateRange: String
    },
    speaker: {
        name: { type: String, required: true },
        alumniId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
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
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Pending', 'Active', 'Inactive'],
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

// Pre-validate to sync fields before Mongoose validation
eventSchema.pre('validate', function () {
    // Sync event_type and type
    if (this.event_type && !this.type) {
        this.type = this.event_type;
    } else if (this.type) {
        this.event_type = this.type;
    }

    // Sync dates
    if (this.event_date && !this.date) this.date = this.event_date;
    else if (this.date && !this.event_date) this.event_date = this.date;

    // Force Offline for specific categories if they are College Events
    if (this.type === 'College Event' && ['Farewell', 'Celebration'].includes(this.category)) {
        this.mode = 'Offline';
    }
});

module.exports = mongoose.model('Event', eventSchema);
