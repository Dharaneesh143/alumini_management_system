const User = require('../models/User');
const Job = require('../models/Job');
const Mentorship = require('../models/Mentorship');
const mongoose = require('mongoose');


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
// Get Alumni Dashboard Statistics
exports.getAlumniStats = async (req, res) => {
    try {
        const alumniId = req.user.id;

        // 1. Active Mentees (Accepted mentorships)
        const activeMenteesCount = await Mentorship.countDocuments({
            alumni: alumniId,
            status: { $in: ['accepted', 'Active'] }
        });

        // 2. Mentorship Requests (Pending)
        const pendingRequestsCount = await Mentorship.countDocuments({
            alumni: alumniId,
            status: { $in: ['pending', 'Pending'] }
        });

        // 3. Completed Sessions
        const completedSessionsCount = await Mentorship.countDocuments({
            alumni: alumniId,
            status: { $in: ['completed', 'Completed'] }
        });

        // 4. Job Referrals (Jobs posted by this alumni)
        const jobReferralsCount = await Job.countDocuments({
            postedBy: alumniId
        });

        // 5. Monthly Distribution (for the bar chart)
        // Grouping by month for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyStats = await Mentorship.aggregate([
            {
                $match: {
                    alumni: new mongoose.Types.ObjectId(alumniId),
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Format month names
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedMonthlyData = monthlyStats.map(stat => ({
            month: monthNames[stat._id.month - 1],
            sessions: stat.count
        }));

        res.json({
            activeMentees: activeMenteesCount,
            pendingRequests: pendingRequestsCount,
            completedSessions: completedSessionsCount,
            jobReferrals: jobReferralsCount,
            monthlyData: formattedMonthlyData
        });

    } catch (err) {
        console.error('Alumni Stats Error:', err.message);
        res.status(500).send('Server Error');
    }
};


