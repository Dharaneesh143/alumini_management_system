const User = require('../models/User');
const Job = require('../models/Job');

// Get Student Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Student Profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, profile } = req.body;
        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (profile) {
            user.profile = { ...user.profile, ...profile };
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Jobs (for Students)
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ postedDate: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Apply for a Job
exports.applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if already applied
        if (job.applicants.some(applicant => applicant.user.toString() === req.user.id)) {
            return res.status(400).json({ msg: 'Already applied for this job' });
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
        // Find jobs where the applicants array contains the user's ID
        const jobs = await Job.find({ 'applicants.user': req.user.id }).sort({ postedDate: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
