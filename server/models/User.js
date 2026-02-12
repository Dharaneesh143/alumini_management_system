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
    phone_number: String, // Explicit mapping from request
    department: String,
    batch: String,
    passedOutYear: String,
    currentCompany: String,
    company_name: String, // Explicit mapping from request
    jobRole: String,
    designation: String, // Explicit mapping from request
    profile_image: String,
    resume: String, // PDF path for students
    accountStatus: {
        type: String,
        enum: ['active', 'blocked', 'deactivated'],
        default: 'active'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
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
    deactivationRequest: {
        status: { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
        reason: String,
        requestedAt: Date
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
        resumeUrl: String,
        cgpa: String
    }
}, { timestamps: true });

// Pre-save middleware to sync fields
userSchema.pre('save', async function () {
    if (this.role === 'alumni') {
        if (this.batch && !this.passedOutYear) this.passedOutYear = this.batch;
        if (!this.batch && this.passedOutYear) this.batch = this.passedOutYear;

        if (this.currentCompany) {
            this.profile.company = this.currentCompany;
            this.company_name = this.currentCompany;
        } else if (this.company_name) {
            this.profile.company = this.company_name;
            this.currentCompany = this.company_name;
        }

        if (this.jobRole) {
            this.profile.designation = this.jobRole;
            this.designation = this.jobRole;
        } else if (this.designation) {
            this.profile.designation = this.designation;
            this.jobRole = this.designation;
        }
    }

    if (this.department) this.profile.department = this.department;
    if (this.batch) this.profile.batch = this.batch;

    if (this.phoneNumber) this.phone_number = this.phoneNumber;
    else if (this.phone_number) this.phoneNumber = this.phone_number;

    if (this.accountStatus === 'active') this.status = 'Active';
    else if (this.status === 'Active') this.accountStatus = 'active';
    else if (this.status === 'Inactive' && this.accountStatus === 'active') this.accountStatus = 'deactivated';
});

module.exports = mongoose.model('User', userSchema);
