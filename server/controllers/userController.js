const User = require('../models/User');

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, profile } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (profile) {
            user.profile = {
                ...user.profile,
                ...profile
            };

            // Sync top-level fields for convenience/legacy
            if (user.role === 'alumni') {
                if (profile.batch) user.passedOutYear = profile.batch;
                if (profile.company) user.currentCompany = profile.company;
                if (profile.designation) user.jobRole = profile.designation;
            } else if (user.role === 'student') {
                if (profile.batch) user.profile.batch = profile.batch;
            }
        }

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all verified users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            $or: [
                { role: 'admin' },
                { role: 'student' },
                { role: 'alumni', approvalStatus: 'approved' }
            ]
        }).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // RBAC: Non-admins can only see their own profile
        if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
            return res.status(403).json({ msg: 'Access denied. You can only view your own profile.' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};
