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
        const { name, profile } = req.body;
        const user = await User.findById(req.user.id);

        // Verification check could be added here if critical info changes

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

// Post a Job
exports.postJob = async (req, res) => {
    try {
        // Strict verification check
        const user = await User.findById(req.user.id);
        if (!user.isVerified) {
            return res.status(403).json({ msg: 'Account not verified. Cannot post jobs.' });
        }

        const newJob = new Job({
            ...req.body,
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
        const jobs = await Job.find({ postedBy: req.user.id }).sort({ postedDate: -1 });
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

        // Ensure job belongs to logged in alumni
        if (job.postedBy.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(job.applicants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
