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
        enum: ['student', 'alumni'],
        default: 'student'
    },
    // Student specific
    registerNumber: {
        type: String,
        sparse: true,
        unique: true
    },
    // Alumni specific
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: function () {
            return this.role === 'alumni' ? 'pending' : 'approved';
        }
    },
    phoneNumber: String,
    department: String,
    batch: String,
    passedOutYear: String,
    currentCompany: String,
    jobRole: String,
    accountStatus: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    },

    // Mentor specific
    isMentor: {
        type: Boolean,
        default: false
    },
    mentorSettings: {
        capacity: { type: Number, default: 3 },
        mentorshipAreas: [String],
        resumeReview: { type: Boolean, default: true }
    },

    // Common Profile Data
    profile: {
        department: String,
        batch: String, // Year
        company: String,
        designation: String,
        skills: [String],
        linkedin: String,
        github: String,
        resumeUrl: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save middleware to sync fields
userSchema.pre('save', async function () {
    if (this.role === 'alumni') {
        if (this.batch && !this.passedOutYear) this.passedOutYear = this.batch;
        if (!this.batch && this.passedOutYear) this.batch = this.passedOutYear;

        if (this.currentCompany) this.profile.company = this.currentCompany;
        if (this.jobRole) this.profile.designation = this.jobRole;
    }

    if (this.department) this.profile.department = this.department;
    if (this.batch) this.profile.batch = this.batch;
});

module.exports = mongoose.model('User', userSchema);
