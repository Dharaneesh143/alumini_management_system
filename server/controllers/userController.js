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
        if (phoneNumber) {
            user.phoneNumber = phoneNumber;
            user.phone_number = phoneNumber;
        }

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

            // Always update sent fields (don't use 'if' — that skips empty string clears)
            if ('department' in profile) user.profile.department = profile.department;
            if ('batch' in profile) user.profile.batch = profile.batch;
            if ('cgpa' in profile) user.profile.cgpa = profile.cgpa;
            if ('company' in profile) user.profile.company = profile.company;
            if ('designation' in profile) user.profile.designation = profile.designation;
            if ('linkedin' in profile) user.profile.linkedin = profile.linkedin;
            if ('github' in profile) user.profile.github = profile.github;
            if ('resumeUrl' in profile) user.profile.resumeUrl = profile.resumeUrl;
            if ('yearOfStudy' in profile) user.profile.yearOfStudy = profile.yearOfStudy;
            if ('currentLocation' in profile) user.profile.currentLocation = profile.currentLocation;
            if ('yearsOfExperience' in profile) user.profile.yearsOfExperience = profile.yearsOfExperience;
            if ('companyWebsite' in profile) user.profile.companyWebsite = profile.companyWebsite;
            if ('oldCompany' in profile) user.profile.oldCompany = profile.oldCompany;

            // Handle skills array explicitly
            if (profile.skills) {
                user.profile.skills = Array.isArray(profile.skills)
                    ? profile.skills
                    : profile.skills.split(',').map(s => s.trim());
            }

            // Sync top-level fields — both student and alumni
            if ('department' in profile) user.department = profile.department;
            if ('batch' in profile) {
                user.batch = profile.batch;
                if (user.role === 'alumni') user.passedOutYear = profile.batch;
            }
            if (user.role === 'alumni') {
                if ('company' in profile) user.currentCompany = profile.company;
                if ('designation' in profile) user.jobRole = profile.designation;
            } else if (user.role === 'student') {
                if ('yearOfStudy' in profile) user.yearOfStudy = profile.yearOfStudy;
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
