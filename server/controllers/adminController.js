const User = require('../models/User');
const Job = require('../models/Job');

// Get system stats
exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const verifiedAlumni = await User.countDocuments({ role: 'alumni', isVerified: true });
        const pendingAlumni = await User.countDocuments({ role: 'alumni', isVerified: false });
        const totalJobs = await Job.countDocuments();

        res.json({
            totalUsers,
            totalStudents,
            totalAlumni,
            verifiedAlumni,
            pendingAlumni,
            totalJobs
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all users with filters
exports.getAllUsers = async (req, res) => {
    try {
        const { role, isVerified } = req.query;
        const filter = {};

        if (role) filter.role = role;
        if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Verify/Reject alumni
exports.verifyAlumni = async (req, res) => {
    try {
        const { userId, isVerified } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.role !== 'alumni') {
            return res.status(400).json({ msg: 'User is not an alumni' });
        }

        user.isVerified = isVerified;
        await user.save();

        res.json({ msg: `Alumni ${isVerified ? 'verified' : 'rejected'} successfully`, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Deactivate user
exports.deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'User deactivated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
