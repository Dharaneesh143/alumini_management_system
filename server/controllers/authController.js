const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User (Handles Student, Alumni)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, registerNumber, phoneNumber, passedOutYear, currentCompany, jobRole, department, batch } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        if (registerNumber) {
            const existingStudent = await User.findOne({ registerNumber });
            if (existingStudent) {
                return res.status(400).json({ msg: 'Register number already exists' });
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Map data based on role
        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role || 'student',
            department: department || 'N/A',
            batch: batch || passedOutYear || req.body.graduationYear || 'N/A',
            phoneNumber: phoneNumber || 'N/A',
            profile: {
                department: department || 'N/A',
                batch: batch || passedOutYear || req.body.graduationYear || 'N/A',
                company: currentCompany || 'N/A',
                designation: jobRole || 'N/A'
            }
        };

        if (userData.role === 'student') {
            userData.registerNumber = registerNumber;
            userData.approvalStatus = 'approved'; // Students are auto-approved
        } else if (userData.role === 'alumni') {
            userData.passedOutYear = userData.batch;
            userData.currentCompany = currentCompany;
            userData.jobRole = jobRole;
            userData.approvalStatus = 'pending'; // Alumni need admin approval
        }

        user = new User(userData);
        await user.save();

        const payload = {
            user: {
                id: user._id,
                role: user.role
            }
        };

        const token = await new Promise((resolve, reject) => {
            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '5h' },
                (err, token) => {
                    if (err) reject(err);
                    else resolve(token);
                }
            );
        });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                isVerified: user.approvalStatus === 'approved'
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Generic Login (Used by Student, Alumni portals)
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Role Check
        if (role && user.role !== role) {
            return res.status(403).json({ msg: 'Unauthorized: Role mismatch' });
        }

        // Alumni Approval Check
        if (user.role === 'alumni' && user.approvalStatus !== 'approved') {
            return res.status(403).json({ msg: 'Your alumni account is waiting for admin approval.' });
        }

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
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        role: user.role,
                        isVerified: user.approvalStatus === 'approved',
                        profile: user.profile
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Admin Login (Dedicated collection)
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        let admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(400).json({ msg: 'Invalid Admin Credentials' });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Admin Credentials' });
        }

        const payload = {
            user: {
                id: admin.id,
                role: 'admin'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: admin.id,
                        name: admin.name,
                        role: 'admin'
                    }
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMe = async (req, res) => {
    try {
        let user;
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
