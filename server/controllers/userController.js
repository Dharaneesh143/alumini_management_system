const User = require('../models/User');

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, profile } = req.body; // Expect profile object with dept, skills, etc.
        const userFields = {};
        if (name) userFields.name = name;
        if (profile) userFields.profile = profile;

        // Find and update
        let user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update fields (simplistic merge, deep merge might be better but this replaces the profile obj if provided)
        // Better: use findOneAndUpdate with $set
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

// Get all users (with filters - simplified for networking)
exports.getAllUsers = async (req, res) => {
    try {
        // Basic filtering can be added here
        const users = await User.find({ isVerified: true }).select('-password');
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
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};
