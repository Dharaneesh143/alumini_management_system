const User = require('../models/User');
const Event = require('../models/Event');
const Job = require('../models/Job');
const Mentorship = require('../models/Mentorship');

// Get Student Profile
exports.getProfile = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).select('-password');
        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Student Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phoneNumber, department, batch, skills, linkedin, github } = req.body;
        const student = await User.findById(req.user.id);

        if (name) student.name = name;
        if (phoneNumber) {
            student.phoneNumber = phoneNumber;
            student.phone_number = phoneNumber;
        }
        if (department) {
            student.department = department;
            student.profile.department = department;
        }
        if (batch) {
            student.batch = batch;
            student.profile.batch = batch;
        }
        if (skills) student.profile.skills = skills;
        if (linkedin) student.profile.linkedin = linkedin;
        if (github) student.profile.github = github;

        await student.save();
        res.json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Jobs
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().populate('postedBy', 'name');
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Apply For Job
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        if (job.applicants.some(a => a.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Already applied' });
        }

        job.applicants.unshift({ user: req.user.id });
        await job.save();
        res.json(job.applicants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Applied Jobs
exports.getAppliedJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ 'applicants.user': req.user.id }).populate('postedBy', 'name');
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Student Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        const studentId = req.user.id;

        const appliedJobsCount = await Job.countDocuments({
            'applicants.user': studentId
        });

        const mentorshipRequestsCount = await Mentorship.countDocuments({
            student: studentId
        });

        const eventsCount = await Event.countDocuments({
            'attendees.user': studentId
        });

        res.json({
            appliedJobs: appliedJobsCount,
            mentorshipRequests: mentorshipRequestsCount,
            events: eventsCount
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Verified Alumni for Discovery
exports.getVerifiedAlumni = async (req, res) => {
    try {
        const { department, skill, company, area } = req.query;

        let query = {
            role: 'alumni',
            isMentor: true
        };

        if (department) query['profile.department'] = department;
        if (skill) query['profile.skills'] = { $in: [skill] };
        if (company) query['currentCompany'] = new RegExp(company, 'i');
        if (area) query['mentorSettings.mentorshipAreas'] = { $in: [area] };

        const alumni = await User.find(query).select('-password');

        const normalizedAlumni = alumni.map(a => {
            const obj = a.toObject();
            return {
                ...obj,
                id: obj._id,
                isVerified: obj.approvalStatus === 'approved'
            };
        });

        res.json(normalizedAlumni);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Upload Resume
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const student = await User.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        const resumeUrl = `/uploads/resumes/${req.file.filename}`;
        student.profile.resumeUrl = resumeUrl;
        await student.save();

        res.json({ msg: 'Resume uploaded successfully', resumeUrl });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
