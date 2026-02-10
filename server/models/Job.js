const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true // Onsite / Remote / Hybrid
    },
    opportunityType: {
        type: String,
        enum: ['Job', 'Internship'],
        required: true
    },
    // Common Fields
    companyLogo: String,
    jdPdf: String,
    requiredSkills: [String],
    departmentsEligible: [String],
    minQualification: String,
    minCgpa: Number,
    deadline: Date,
    contactEmail: String,
    openingsCount: {
        type: Number,
        default: 1
    },
    referralAvailable: {
        type: Boolean,
        default: false
    },

    // Job Specific Fields
    salaryRange: String, // e.g., "10LPA - 15LPA"
    employmentType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Contract'],
        default: 'Full Time'
    },
    experienceRequired: String, // e.g., "0-2 yrs"

    // Internship Specific Fields
    stipend: String,
    duration: String, // e.g., "6 months"
    startDate: Date,
    endDate: Date,
    ppoAvailable: {
        type: Boolean,
        default: false
    },

    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postedByRole: {
        type: String,
        enum: ['admin', 'alumni'],
        required: true
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'closed', 'deleted_by_admin'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    applicants: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resumeUrl: String,
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['applied', 'viewed', 'shortlisted', 'rejected'],
            default: 'applied'
        }
    }]
});

module.exports = mongoose.model('Job', jobSchema);
