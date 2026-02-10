const User = require('../models/User');

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const Admin = require('../models/Admin');
        let user;

        // Check if user is admin
        if (req.user.role === 'admin') {
            user = await Admin.findById(req.user.id).select('-password');
        } else {
            user = await User.findById(req.user.id).select('-password');
        }

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('GetMe Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        console.log('Update Profile Payload:', JSON.stringify(req.body, null, 2));
        const { name, phoneNumber, profile } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        if (req.body.isMentor !== undefined) user.isMentor = req.body.isMentor;
        if (req.body.mentorSettings) {
            user.mentorSettings = {
                ...user.mentorSettings,
                ...req.body.mentorSettings
            };
        }

        if (profile) {
            // Ensure profile object exists
            if (!user.profile) user.profile = {};

            // Explicitly update fields to ensure Mongoose change tracking works
            if (profile.department) user.profile.department = profile.department;
            if (profile.batch) user.profile.batch = profile.batch;
            if (profile.cgpa) user.profile.cgpa = profile.cgpa;
            if (profile.company) user.profile.company = profile.company;
            if (profile.designation) user.profile.designation = profile.designation;
            if (profile.linkedin) user.profile.linkedin = profile.linkedin;
            if (profile.github) user.profile.github = profile.github;
            if (profile.resumeUrl) user.profile.resumeUrl = profile.resumeUrl;

            // Handle skills array explicitly
            if (profile.skills) {
                user.profile.skills = Array.isArray(profile.skills)
                    ? profile.skills
                    : profile.skills.split(',').map(s => s.trim());
            }

            // Sync top-level fields for convenience/legacy
            if (user.role === 'alumni') {
                if (profile.batch) user.passedOutYear = profile.batch;
                if (profile.company) user.currentCompany = profile.company;
                if (profile.designation) user.jobRole = profile.designation;
            } else if (user.role === 'student') {
                if (profile.department) user.department = profile.department;
                if (profile.batch) user.batch = profile.batch;
            }
        }

        if (profile) user.markModified('profile'); // Force update for mixed types

        await user.save();
        console.log('Updated User:', user);
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

// Deactivate Account (Request flow for Alumni, keep direct for others if needed, but per request applying to all)
exports.deactivateMe = async (req, res) => {
    try {
        const { reason } = req.body;
        await User.findByIdAndUpdate(req.user.id, {
            deactivationRequest: {
                status: 'pending',
                reason: reason || 'No reason provided',
                requestedAt: new Date()
            }
        });
        res.json({ msg: 'Deactivation request sent to admin for approval.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
