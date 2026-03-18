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

// Dismiss the "Enable Mentorship" banner (stored in DB, not localStorage)
exports.dismissMentorshipBanner = async (req, res) => {
    try {
        const alumni = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { mentorshipBannerDismissed: true } },
            { new: true, select: '-password' }
        );
        if (!alumni) return res.status(404).json({ msg: 'User not found' });
        res.json({ mentorshipBannerDismissed: alumni.mentorshipBannerDismissed });
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
        let alumniObjectId;
        try {
            alumniObjectId = new mongoose.Types.ObjectId(alumniId.toString());
        } catch (e) {
            return res.status(400).json({ msg: 'Invalid alumni ID' });
        }

        // 1. Active Mentees
        const activeMenteesCount = await Mentorship.countDocuments({
            alumni: alumniObjectId,
            status: { $in: ['accepted', 'Active'] }
        });

        // 2. Mentorship Requests
        const pendingRequestsCount = await Mentorship.countDocuments({
            alumni: alumniObjectId,
            status: { $in: ['pending', 'Pending'] }
        });

        // 3. Completed Sessions
        const completedSessionsCount = await Mentorship.countDocuments({
            alumni: alumniObjectId,
            status: { $in: ['completed', 'Completed'] }
        });

        // 4. Job Referrals
        const jobReferralsCount = await Job.countDocuments({
            postedBy: alumniObjectId
        });

        // 5. Monthly Distribution
        const monthsData = [];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            monthsData.push({
                month: monthNames[date.getMonth()],
                year: date.getFullYear(),
                monthNum: date.getMonth() + 1,
                sessions: 0
            });
        }

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        sixMonthsAgo.setDate(1);

        const monthlyStats = await Mentorship.aggregate([
            {
                $match: {
                    alumni: alumniObjectId,
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
            }
        ]);

        const formattedMonthlyData = monthsData.map(m => {
            const stat = monthlyStats.find(s => s._id.month === m.monthNum && s._id.year === m.year);
            return {
                month: m.month,
                sessions: stat ? stat.count : 0
            };
        });

        res.json({
            activeMentees: activeMenteesCount,
            pendingRequests: pendingRequestsCount,
            completedSessions: completedSessionsCount,
            jobReferrals: jobReferralsCount,
            monthlyData: formattedMonthlyData
        });

    } catch (err) {
        res.status(500).send('Server Error');
    }
};
