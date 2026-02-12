const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Application = require('../models/Application');
const sendEmail = require('../utils/emailService');

// @route   POST api/jobs
// @desc    Create a job or internship posting
// @access  Private (Alumni or Admin)
exports.createJob = async (req, res) => {
    try {
        const {
            title, description, company, company_name, location,
            opportunityType, job_type,
            skills_required, requiredSkills, departmentsEligible,
            minQualification, eligibility,
            deadline, application_deadline,
            contactEmail, openingsCount,
            referralAvailable, salaryRange, salary, employmentType, experienceRequired,
            stipend, duration, startDate, start_date, endDate, end_date, ppoAvailable
        } = req.body;

        const jobData = {
            title,
            description,
            company: company || company_name,
            company_name: company_name || company,
            location,
            opportunityType: opportunityType || (job_type === 'Full-Time' ? 'Job' : 'Internship'),
            job_type: job_type || (opportunityType === 'Job' ? 'Full-Time' : 'Internship'),
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : (Array.isArray(skills_required) ? skills_required : (skills_required ? skills_required.split(',').map(s => s.trim()) : []))),
            skills_required: Array.isArray(skills_required) ? skills_required : (skills_required ? skills_required.split(',').map(s => s.trim()) : (Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []))),
            departmentsEligible: Array.isArray(departmentsEligible) ? departmentsEligible : (departmentsEligible ? departmentsEligible.split(',').map(s => s.trim()) : []),
            minQualification,
            eligibility: eligibility || minQualification,
            deadline: deadline || application_deadline,
            application_deadline: application_deadline || deadline,
            contactEmail,
            openingsCount,
            referralAvailable: referralAvailable === 'true' || referralAvailable === true,
            postedBy: req.user.id,
            postedByRole: req.user.role,
            approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending'
        };

        // Handle File Uploads
        if (req.files) {
            if (req.files.companyLogo) {
                jobData.companyLogo = `/uploads/logos/${req.files.companyLogo[0].filename}`;
            }
            if (req.files.jdPdf) {
                jobData.jdPdf = `/uploads/jobs/jd/${req.files.jdPdf[0].filename}`;
            }
        }

        // Type specific fields
        if (jobData.opportunityType === 'Job' || jobData.job_type === 'Full-Time') {
            jobData.salaryRange = salaryRange || salary;
            jobData.salary = salary || salaryRange;
            jobData.employmentType = employmentType;
            jobData.experienceRequired = experienceRequired;
        } else {
            jobData.stipend = stipend;
            jobData.duration = duration;
            jobData.startDate = startDate || start_date;
            jobData.start_date = start_date || startDate;
            jobData.endDate = endDate || end_date;
            jobData.end_date = end_date || endDate;
            jobData.ppoAvailable = ppoAvailable === 'true' || ppoAvailable === true;
        }

        const job = new Job(jobData);
        await job.save();
        res.status(201).json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// @route   GET api/jobs
// @desc    Get all jobs (with filters)
exports.getJobs = async (req, res) => {
    try {
        const {
            type, search, skill, minSalary, department,
            pendingOnly // Admin filter
        } = req.query;

        let query = {};

        // 1. RBAC View Permissions (Base Query)
        if (req.user.role === 'admin') {
            if (pendingOnly === 'true') {
                query.approvalStatus = 'pending';
            }
        } else {
            // Non-admins see approved jobs OR their own postings
            let eligibilityFilter = {};
            if (req.user.role === 'student') {
                const currentUser = await User.findById(req.user.id);
                const userDept = currentUser?.department || 'N/A';

                eligibilityFilter = {
                    $or: [
                        { departmentsEligible: { $exists: false } },
                        { departmentsEligible: { $size: 0 } },
                        { departmentsEligible: 'Any' },
                        { departmentsEligible: userDept }
                    ]
                };
            }

            query = {
                status: 'active', // Fixed typo from $status
                $or: [
                    {
                        approvalStatus: 'approved',
                        ...eligibilityFilter
                    },
                    { postedBy: req.user.id }
                ]
            };
        }

        // 2. Add Filters
        const filters = [];
        if (type) filters.push({ opportunityType: type });
        if (department) filters.push({ departmentsEligible: department });
        if (search) {
            filters.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } }
                ]
            });
        }
        if (skill) filters.push({ requiredSkills: { $in: [new RegExp(skill, 'i')] } });

        if (filters.length > 0) {
            query = { $and: [query, ...filters] };
        }

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name email profile.company');

        // 3. Add hasApplied Flag for Students
        let jobsWithStatus = jobs.map(job => job.toObject());

        if (req.user.role === 'student') {
            const studentId = req.user.id;
            // Fetch all applications for this student to map efficiently
            const applications = await Application.find({ studentId }).select('jobId');
            const appliedJobIds = new Set(applications.map(app => app.jobId.toString()));

            jobsWithStatus = jobsWithStatus.map(job => ({
                ...job,
                hasApplied: appliedJobIds.has(job._id.toString())
            }));
        }

        res.json(jobsWithStatus);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET api/jobs/:id
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name email profile');

        if (!job) return res.status(404).json({ msg: 'Opportunity not found' });

        // Check if student has already applied
        let hasApplied = false;
        if (req.user.role === 'student') {
            const application = await Application.findOne({ jobId: job._id, studentId: req.user.id });
            hasApplied = !!application;
        }

        res.json({ ...job._doc, hasApplied });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/jobs/:id/apply
exports.applyJob = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ msg: 'Only students can apply.' });
        }

        const { phone, portfolioUrl, coverLetter } = req.body;

        if (!req.file) {
            return res.status(400).json({ msg: 'Resume PDF is required.' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        if (job.approvalStatus !== 'approved' || job.status !== 'active') {
            return res.status(400).json({ msg: 'This opportunity is not accepting applications.' });
        }

        // Check Duplicate
        const existingApp = await Application.findOne({ jobId: job._id, studentId: req.user.id });
        if (existingApp) {
            return res.status(400).json({ msg: 'Already applied for this position.' });
        }

        // Create Application
        const application = new Application({
            jobId: job._id,
            studentId: req.user.id,
            resumeUrl: `/uploads/resumes/${req.file.filename}`,
            additionalDetails: { phone, portfolioUrl, coverLetter }
        });
        await application.save();

        // Sync with Job.applicants (Optional but good for analytics)
        job.applicants.push({
            user: req.user.id,
            resumeUrl: `/uploads/resumes/${req.file.filename}`
        });
        await job.save();

        // Notify Poster
        const applicantInfo = await User.findById(req.user.id).select('name');
        await Notification.create({
            recipient: job.postedBy,
            sender: req.user.id,
            type: 'job_application',
            title: 'New Applicant',
            content: `${applicantInfo.name} applied for "${job.title}" at ${job.company}`,
            link: `/jobs/${job._id}/applicants`
        });

        res.status(201).json({ msg: 'Application submitted successfully', application });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @route   GET api/jobs/:id/applicants
exports.getJobApplicants = async (req, res) => {
    try {
        const applications = await Application.find({ jobId: req.params.id })
            .populate('studentId', 'name email profile department batch')
            .sort({ appliedAt: -1 });

        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PATCH api/jobs/applications/:id/status
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body; // 'Shortlisted', 'Rejected'
        const application = await Application.findById(req.params.id).populate('jobId');

        if (!application) return res.status(404).json({ msg: 'Application not found' });

        application.status = status;
        await application.save();

        // Notify Student
        await Notification.create({
            recipient: application.studentId,
            sender: req.user.id,
            type: 'job_update',
            title: `Application Update: ${application.jobId.title}`,
            content: `Your application for ${application.jobId.company} has been marked as ${status}.`,
            link: `/jobs/${application.jobId._id}`
        });

        res.json(application);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT api/jobs/:id
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // RBAC Check
        if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to edit this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE api/jobs/:id
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // RBAC Check
        if (req.user.role !== 'admin' && job.postedBy.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to delete this job' });
        }

        if (req.user.role === 'admin') {
            job.status = 'deleted_by_admin';
        } else {
            job.status = 'closed';
        }
        await job.save();
        res.json({ msg: 'Job status updated', status: job.status });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// @route   PATCH api/jobs/:id/approve
exports.approveJob = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Admin only' });

        const { status } = req.body; // 'approved' or 'rejected'
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        job.approvalStatus = status;
        await job.save();

        // Notify Alumni
        await Notification.create({
            recipient: job.postedBy,
            sender: req.user.id,
            type: 'admin_action',
            title: `Job Posting ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            content: `Your job posting for "${job.title}" at ${job.company} has been ${status}.`,
            link: `/jobs/${job._id}`
        });

        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
