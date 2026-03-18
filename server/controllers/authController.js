const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
            name, email, password, role,
            phoneNumber, phone_number,
            registerNumber, department,
            batch, graduationYear, passedOutYear,
            yearOfStudy,
            currentCompany, company_name,
            jobRole, designation,
            currentLocation, yearsOfExperience,
            companyWebsite, oldCompany,
            profile_image, resume
        } = req.body;

        // Domain checks
        if ((role === 'student' || !role) && email && !email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(400).json({ msg: 'Students must use their @bitsathy.ac.in email address' });
        }
        if (role === 'alumni' && email && email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(400).json({ msg: 'Alumni must use a Alumni email address (e.g., Gmail), not @bitsathy.ac.in' });
        }

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
                designation: jobRole || designation || 'N/A',
                yearOfStudy: yearOfStudy || 'N/A',
                currentLocation: currentLocation || 'N/A',
                yearsOfExperience: yearsOfExperience || 'N/A',
                companyWebsite: companyWebsite || 'N/A',
                oldCompany: oldCompany || 'N/A'
            }
        };

        if (userData.role === 'student') {
            userData.registerNumber = registerNumber;
            userData.yearOfStudy = yearOfStudy;
            userData.approvalStatus = 'approved';
        } else if (userData.role === 'alumni') {
            userData.passedOutYear = userData.batch;
            userData.currentCompany = currentCompany || company_name;
            userData.company_name = company_name || currentCompany;
            userData.jobRole = jobRole || designation;
            userData.designation = designation || jobRole;
            userData.currentLocation = currentLocation;
            userData.yearsOfExperience = yearsOfExperience;
            userData.companyWebsite = companyWebsite;
            userData.oldCompany = oldCompany;
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
                isVerified: user.approvalStatus === 'approved',
                phoneNumber: user.phoneNumber,
                phone_number: user.phone_number
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

        // Domain checks
        if (role === 'student' && email && !email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(403).json({ msg: 'Students must use their @bitsathy.ac.in email address' });
        }
        if (role === 'alumni' && email && email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(403).json({ msg: 'Alumni must use their personal email to login as an alumni.' });
        }

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
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        approvalStatus: user.approvalStatus,
                        accountStatus: user.accountStatus,
                        department: user.department,
                        batch: user.batch,
                        passedOutYear: user.passedOutYear,
                        yearOfStudy: user.yearOfStudy,
                        isMentor: user.isMentor,
                        mentorshipBannerDismissed: user.mentorshipBannerDismissed,
                        isVerified: user.approvalStatus === 'approved',
                        phoneNumber: user.phoneNumber,
                        phone_number: user.phone_number,
                        profile: user.profile,
                        createdAt: user.createdAt
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
                        role: 'admin',
                        phoneNumber: admin.phoneNumber,
                        phone_number: admin.phone_number
                    }
                });
            }
        );

    } catch (err) {
        console.error('💥 Admin Login Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Google Login
exports.googleLogin = async (req, res) => {
    try {
        const { idToken, role } = req.body;

        if (!idToken) {
            return res.status(400).json({ msg: 'No Google ID Token provided' });
        }

        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;

        // Domain checks
        if (role === 'student' && email && !email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(403).json({ msg: 'Students must use their @bitsathy.ac.in email address' });
        }
        if (role === 'alumni' && email && email.toLowerCase().endsWith('@bitsathy.ac.in')) {
            return res.status(403).json({ msg: 'Alumni must use their personal email for Google login.' });
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            // For Google login, we might not have all fields, so we'll use defaults
            const userData = {
                name,
                email,
                password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
                role: role || 'student',
                profile_image: picture,
                approvalStatus: (role === 'alumni') ? 'pending' : 'approved',
                profile: {
                    department: 'N/A',
                    batch: 'N/A',
                    company: 'N/A',
                    designation: 'N/A'
                }
            };

            user = new User(userData);
            await user.save();
        } else {
            // If user exists, optionally update their picture if not set
            if (!user.profile_image) {
                user.profile_image = picture;
                await user.save();
            }

            // Role Check (if role is provided and doesn't match)
            if (role && user.role !== role) {
                return res.status(403).json({ msg: `Account exists but role mismatch. Expected ${role}, found ${user.role}` });
            }
        }

        // Standard Login Checks (Block/Pending/Deactivated)
        if (user.role === 'alumni' && user.approvalStatus !== 'approved') {
            return res.status(403).json({ msg: 'Your alumni account is waiting for admin approval.' });
        }

        if (user.accountStatus === 'deactivated' || user.accountStatus === 'blocked') {
            return res.status(403).json({ msg: 'Your account has been deactivated or blocked.' });
        }

        // Generate JWT
        const jwtPayload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            jwtPayload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.id,
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        approvalStatus: user.approvalStatus,
                        profile_image: user.profile_image
                    }
                });
            }
        );

    } catch (err) {
        console.error('Google Login Error:', err.message);
        res.status(500).json({ msg: 'Google Authentication failed', error: err.message });
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
