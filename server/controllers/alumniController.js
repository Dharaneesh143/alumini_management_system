const User = require('../models/User');
const Job = require('../models/Job');

// Get Alumni Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Alumni Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, profile, isMentor, mentorSettings } = req.body;
        const alumni = await User.findById(req.user.id);

        if (!alumni) return res.status(404).json({ msg: 'Alumni not found' });

        if (name) alumni.name = name;
        if (profile) {
            alumni.profile = { ...alumni.profile, ...profile };
            if (profile.batch) {
                alumni.batch = profile.batch;
                alumni.passedOutYear = profile.batch;
            }
            if (profile.department) alumni.department = profile.department;
            if (profile.phoneNumber) alumni.phoneNumber = profile.phoneNumber;
        }

        // Mentorship settings
        if (typeof isMentor === 'boolean') alumni.isMentor = isMentor;
        if (mentorSettings) {
            alumni.mentorSettings = {
                ...alumni.mentorSettings,
                ...mentorSettings
            };
        }

        await alumni.save();
        res.json(alumni);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Post a Job
exports.postJob = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.approvalStatus !== 'approved') {
            return res.status(403).json({ msg: 'Account not verified. Cannot post jobs.' });
        }

        const newJob = new Job({
            title: req.body.title,
            company: req.body.company,
            location: req.body.location,
            description: req.body.description,
            requirements: req.body.requirements,
            salary: req.body.salary,
            jobType: req.body.jobType,
            postedBy: req.user.id
        });

        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get My Posted Jobs
exports.getMyJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Job Applicants
exports.getJobApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId).populate('applicants.user', ['name', 'email', 'profile']);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(job.applicants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
