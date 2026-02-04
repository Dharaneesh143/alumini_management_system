const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, profile } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Verification status: Alumni = false (pending), Student = true (auto)
        // Admin verification logic can be refined later
        const isVerified = role === 'alumni' ? false : true;

        user = new User({
            name,
            email,
            password: hashedPassword,
            role,
            isVerified,
            profile // Optional profile data during registration
        });

        await user.save();

        // payload for token (optional to login immediately, but maybe wait for verify if alumni)
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role, isVerified } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Login User (Student & Alumni)
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log('Login attempt:', { email, role }); // DEBUG LOG

        // Check user
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Verify Role if provided (Strict Check)
        if (role && user.role !== role) {
            return res.status(403).json({ msg: 'Unauthorized: Role mismatch' });
        }

        // Prevent Admin from logging in via this portal (if strict separation requested)
        if (user.role === 'admin') {
            return res.status(403).json({ msg: 'Admins must use the Admin Portal' });
        }

        // Alumni Verification Check
        if (user.role === 'alumni' && !user.isVerified) {
            return res.status(403).json({ msg: 'Your alumni account is pending admin verification.' });
        }

        // Return token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role, isVerified: user.isVerified } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin Login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Admin Login Attempt:', { email }); // Debug Log

        // Check user
        let user = await User.findOne({ email });
        if (!user) {
            console.log('Admin Login Failed: User not found');
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        console.log('User found, Role:', user.role); // Debug Log

        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Admin Login Failed: Password mismatch');
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Force Admin Role Check
        if (user.role !== 'admin') {
            console.log('Admin Login Failed: Role denied (' + user.role + ')');
            return res.status(403).json({ msg: 'Access Denied: Admins Only' });
        }

        // Return token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, role: user.role, isVerified: user.isVerified } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Current User (Me)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
