const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company_name: String, // Explicit mapping from request
    company: {
        type: String,
        required: true
    },
    job_type: { // Explicit mapping from request
        type: String,
        enum: ['Full-Time', 'Internship']
    },
    opportunityType: {
        type: String,
        enum: ['Job', 'Internship'],
        required: true
    },
    salary: String, // For full-time
    salaryRange: String, // Internal field
    stipend: String, // For internship
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    eligibility: String, // Matching request
    skills_required: [String], // Matching request
    requiredSkills: [String], // Internal field
    start_date: Date,
    startDate: Date, // Internal field
    end_date: Date,
    endDate: Date, // Internal field
    application_deadline: Date,
    deadline: Date, // Internal field

    // Common Fields
    companyLogo: String,
    jdPdf: String,
    departmentsEligible: [String],
    minQualification: String,
    minCgpa: Number,
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
    employmentType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Contract'],
        default: 'Full Time'
    },
    experienceRequired: String,

    // Internship Specific Fields
    duration: String,
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
    total_applicants: {
        type: Number,
        default: 0
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['Open', 'Closed', 'active', 'inactive', 'closed', 'deleted_by_admin'],
        default: 'Open'
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
}, { timestamps: true });

// Pre-validate to sync fields before Mongoose validation
jobSchema.pre('validate', function () {
    if (this.company_name && !this.company) this.company = this.company_name;
    else if (this.company && !this.company_name) this.company_name = this.company;

    if (this.job_type) {
        this.opportunityType = this.job_type === 'Full-Time' ? 'Job' : 'Internship';
    } else if (this.opportunityType && !this.job_type) {
        this.job_type = this.opportunityType === 'Job' ? 'Full-Time' : 'Internship';
    }

    if (this.salary && !this.salaryRange) this.salaryRange = this.salary;
    else if (this.salaryRange && !this.salary) this.salary = this.salaryRange;

    if (this.skills_required && this.skills_required.length > 0 && (!this.requiredSkills || this.requiredSkills.length === 0)) {
        this.requiredSkills = this.skills_required;
    } else if (this.requiredSkills && this.requiredSkills.length > 0 && (!this.skills_required || this.skills_required.length === 0)) {
        this.skills_required = this.requiredSkills;
    }

    if (this.start_date && !this.startDate) this.startDate = this.start_date;
    else if (this.startDate && !this.start_date) this.start_date = this.startDate;

    if (this.end_date && !this.endDate) this.endDate = this.end_date;
    else if (this.endDate && !this.end_date) this.end_date = this.endDate;

    if (this.application_deadline && !this.deadline) this.deadline = this.application_deadline;
    else if (this.deadline && !this.application_deadline) this.application_deadline = this.deadline;

    if (this.status === 'active' || this.status === 'Open') {
        this.status = 'Open';
    } else if (this.status === 'closed' || this.status === 'Closed') {
        this.status = 'Closed';
    }

    if (this.applicants) {
        this.total_applicants = this.applicants.length;
    }
});

module.exports = mongoose.model('Job', jobSchema);
