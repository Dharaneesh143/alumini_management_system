const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job_id: { // Explicit mapping from request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    student_id: { // Explicit mapping from request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume_used: String, // Explicit mapping from request
    resumeUrl: {
        type: String,
        required: true
    },
    additionalDetails: {
        phone: String,
        portfolioUrl: String,
        coverLetter: String
    },
    status: {
        type: String,
        enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected'],
        default: 'Applied'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    applied_date: Date // Explicit mapping from request
}, { timestamps: true });

// Pre-validate to sync fields before Mongoose validation
applicationSchema.pre('validate', function () {
    if (this.job_id && !this.jobId) this.jobId = this.job_id;
    else if (this.jobId && !this.job_id) this.job_id = this.jobId;

    if (this.student_id && !this.studentId) this.studentId = this.student_id;
    else if (this.studentId && !this.student_id) this.student_id = this.studentId;

    if (this.resume_used && !this.resumeUrl) this.resumeUrl = this.resume_used;
    else if (this.resumeUrl && !this.resume_used) this.resume_used = this.resumeUrl;

    if (!this.applied_date && this.appliedAt) this.applied_date = this.appliedAt;
    else if (this.applied_date && !this.appliedAt) this.appliedAt = this.applied_date;
});

// Prevent multiple applications from the same student for the same job
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
