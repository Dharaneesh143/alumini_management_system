const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: { // Explicit mapping from request (Recipient)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['job_application', 'mentorship_request', 'admin_alert', 'admin_action', 'general', 'Job', 'Event', 'Mentorship'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: String, // Explicit mapping from request (Content)
    content: {
        type: String,
        required: true
    },
    reference_id: { // Explicit mapping from request
        type: mongoose.Schema.Types.ObjectId
    },
    link: {
        type: String
    },
    is_read: { // Explicit mapping from request
        type: Boolean,
        default: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Pre-validate to sync fields before Mongoose validation
notificationSchema.pre('validate', function () {
    if (this.user_id && !this.recipient) this.recipient = this.user_id;
    else if (this.recipient && !this.user_id) this.user_id = this.recipient;

    if (this.message && !this.content) this.content = this.message;
    else if (this.content && !this.message) this.message = this.content;

    if (typeof this.is_read !== 'undefined' && typeof this.isRead === 'undefined') this.isRead = this.is_read;
    else if (typeof this.isRead !== 'undefined' && typeof this.is_read === 'undefined') this.is_read = this.isRead;

    if (['Job', 'Event', 'Mentorship'].includes(this.type)) {
        // Already matching request
    } else {
        if (this.type === 'job_application') this.type = 'Job';
        else if (this.type === 'mentorship_request') this.type = 'Mentorship';
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
