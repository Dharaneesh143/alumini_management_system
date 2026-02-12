const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Helper to log to debug.log
const logToFile = (msg) => {
    const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync(path.join(__dirname, '../debug.log'), logMsg);
    } catch (e) { }
    console.log(msg);
};

// Register User (Handles Student, Alumni)
exports.register = async (req, res) => {
    try {
        const {
            name, email, password, role, registerNumber,
            phoneNumber, phone_number,
            passedOutYear,
            currentCompany, company_name,
            jobRole, designation,
            department, batch,
            profile_image, resume
        } = req.body;

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
            phoneNumber: phoneNumber || phone_number || 'N/A',
            phone_number: phone_number || phoneNumber || 'N/A',
            profile_image,
            resume,
            profile: {
                department: department || 'N/A',
                batch: batch || passedOutYear || req.body.graduationYear || 'N/A',
                company: currentCompany || company_name || 'N/A',
                designation: jobRole || designation || 'N/A'
            }
        };

        if (userData.role === 'student') {
            userData.registerNumber = registerNumber;
            userData.approvalStatus = 'approved';
        } else if (userData.role === 'alumni') {
            userData.passedOutYear = userData.batch;
            userData.currentCompany = currentCompany || company_name;
            userData.company_name = company_name || currentCompany;
            userData.jobRole = jobRole || designation;
            userData.designation = designation || jobRole;
            userData.approvalStatus = 'pending';
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

        // Account Status Check
        if (user.accountStatus === 'deactivated') {
            return res.status(403).json({ msg: 'Your account has been deactivated. Please contact support for reactivation.' });
        }

        if (user.accountStatus === 'blocked') {
            return res.status(403).json({ msg: 'Your account has been blocked. Please contact the administrator.' });
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

// Admin Login (Checks User collection for role='admin')
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        logToFile(`🔍 Admin Login Attempt: ${JSON.stringify({ email, passwordLength: password?.length })}`);

        // Check User collection for admin role
        let admin = await User.findOne({ email, role: 'admin' });
        logToFile(`🔍 Admin found: ${admin ? `Yes (${admin.name})` : 'No'}`);

        if (!admin) {
            logToFile(`❌ Admin ${email} not found in User collection`);
            return res.status(400).json({ msg: 'Invalid Admin Credentials' });
        }

        logToFile('🔍 Comparing passwords...');
        const isMatch = await bcrypt.compare(password, admin.password);
        logToFile(`🔍 Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);

        if (!isMatch) {
            logToFile(`❌ Password mismatch for ${email}`);
            return res.status(400).json({ msg: 'Invalid Admin Credentials' });
        }

        logToFile(`✅ Admin login successful for ${email}!`);
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
        console.error('💥 Admin Login Error:', err.message);
        res.status(500).send('Server Error');
    }
};

exports.getMe = async (req, res) => {
    try {
        // All users (including admins) are in User collection
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
