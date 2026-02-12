const User = require('../models/User');
const Admin = require('../models/Admin');
const Job = require('../models/Job');
const Mentorship = require('../models/Mentorship');
const AuditLog = require('../models/AuditLog');
const sendEmail = require('../utils/emailService');
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

// Get system statistics
// Get system statistics for dashboard analytics
exports.getSystemStats = async (req, res) => {
    try {
        const totalAdmins = await User.countDocuments({ role: 'admin' });
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const verifiedAlumni = await User.countDocuments({ role: 'alumni', approvalStatus: 'approved' });
        const pendingAlumni = await User.countDocuments({ role: 'alumni', approvalStatus: 'pending' });
        const totalJobs = await Job.countDocuments();

        // 1. User Distribution
        const userDistribution = {
            students: totalStudents,
            alumni: totalAlumni,
            admins: totalAdmins
        };

        // 2. Mentorship Activity
        const Mentorship = require('../models/Mentorship');
        const mentorshipStats = await Mentorship.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        const mentorshipActivity = {
            pending: 0,
            accepted: 0,
            rejected: 0,
            removed: 0
        };
        mentorshipStats.forEach(stat => {
            if (mentorshipActivity.hasOwnProperty(stat._id)) {
                mentorshipActivity[stat._id] = stat.count;
            }
        });

        // 3. User Registration Trend (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const registrationTrend = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" },
                        role: "$role"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 4. Job Trend (Last 6 Months)
        const jobTrend = await Job.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 5. Insights / Alerts
        const activeMentorships = mentorshipActivity.accepted;
        const studentsWithoutMentor = await User.countDocuments({
            role: 'student',
            // In a more complex system, we'd check if they have an active Mentorship record
            // For now, let's keep it simple or use a count
        });

        const activeMentors = await User.countDocuments({ role: 'alumni', isMentor: true });

        res.json({
            totalUsers: totalAdmins + totalStudents + totalAlumni,
            totalStudents,
            totalAlumni,
            verifiedAlumni,
            pendingAlumni,
            totalJobs,
            activeMentorships,
            userDistribution,
            mentorshipActivity,
            registrationTrend,
            jobTrend,
            insights: {
                pendingAlumniVerifications: pendingAlumni,
                inactiveAlumniCount: 0, // Placeholder
                studentsWithoutMentor: Math.max(0, totalStudents - activeMentorships),
                activeMentorsCount: activeMentors
            }
        });
    } catch (err) {
        logToFile(`❌ getSystemStats ERROR: ${err.message}\n${err.stack}`);
        res.status(500).send('Server Error');
    }
};

// Get recent system activity
exports.getRecentActivity = async (req, res) => {
    try {
        const activities = await AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(15);
        res.json(activities);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Handle deactivation request (Admin action)
exports.handleDeactivationRequest = async (req, res) => {
    try {
        const { userId, action } = req.body; // action: 'approve' or 'reject'

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (action === 'approve') {
            user.accountStatus = 'deactivated';
            user.status = 'Inactive';
            user.deactivationRequest.status = 'approved';

            // Log the action
            const log = new AuditLog({
                adminId: req.user.id,
                action: 'DEACTIVATION_APPROVED',
                targetEmail: user.email,
                feedback: `Profile deactivation approved for ${user.name}. Reason: ${user.deactivationRequest.reason}`
            });
            await log.save();

        } else if (action === 'reject') {
            user.deactivationRequest.status = 'rejected';

            // Log the action
            const log = new AuditLog({
                adminId: req.user.id,
                action: 'DEACTIVATION_REJECTED',
                targetEmail: user.email,
                feedback: `Profile deactivation rejected for ${user.name}`
            });
            await log.save();
        } else {
            return res.status(400).json({ msg: 'Invalid action' });
        }

        await user.save();
        res.json({ msg: `Request ${action}d successfully` });
    } catch (err) {
        console.error('Handle Deactivation Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get all users with filters
exports.getAllUsers = async (req, res) => {
    try {
        const { role, isVerified } = req.query;
        let filter = {};

        if (role) {
            filter.role = role;
        }

        if (isVerified === 'true') {
            filter.approvalStatus = 'approved';
        } else if (isVerified === 'false') {
            filter.approvalStatus = 'pending';
        }

        if (req.query.status) {
            filter.status = req.query.status;
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

        // Normalize for frontend compatibility if needed
        const normalizedUsers = users.map(u => {
            const userObj = u.toObject();
            return {
                ...userObj,
                isVerified: userObj.approvalStatus === 'approved'
            };
        });

        res.json(normalizedUsers);
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
        if (!user || user.role !== 'alumni') {
            return res.status(404).json({ msg: 'Alumni not found' });
        }

        user.approvalStatus = isVerified ? 'approved' : 'rejected';
        await user.save();

        // Log the action
        const log = new AuditLog({
            adminId: req.user.id,
            action: isVerified ? 'ALUMNI_VERIFIED' : 'ALUMNI_REJECTED',
            targetEmail: user.email,
            feedback: `Alumni ${user.name} ${isVerified ? 'verified' : 'rejected'} by admin`
        });
        await log.save();

        res.json({
            msg: `Alumni ${isVerified ? 'verified' : 'rejected'} successfully`,
            user: {
                ...user.toObject(),
                isVerified: user.approvalStatus === 'approved'
            }
        });
    } catch (err) {
        console.error('Verification Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Deactivate user (Admin action)
exports.deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(
            userId,
            { accountStatus: 'deactivated' },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ msg: 'User found' });
        }

        // Log the action
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'USER_DEACTIVATED',
            targetEmail: user.email,
            feedback: `User ${user.name} deactivated by admin`
        });
        await log.save();

        res.json({ msg: 'User account deactivated successfully', user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Activate user (Admin action)
exports.activateUser = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ msg: 'User ID is required' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { accountStatus: 'active' },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Log the action
        const log = new AuditLog({
            adminId: req.user.id,
            action: 'USER_ACTIVATED',
            targetEmail: user.email,
            feedback: `User ${user.name} activated by admin`
        });
        await log.save();

        res.json({ msg: 'User account activated successfully', user });
    } catch (err) {
        console.error('Activate User Error:', err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// Permanent Delete user with email feedback (Admin action only)
exports.deleteUserWithFeedback = async (req, res) => {
    try {
        const { userId, feedback } = req.body;
        const adminId = req.user.id;

        if (!feedback) {
            return res.status(400).json({ msg: 'Feedback is required' });
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const targetEmail = targetUser.email;
        const targetName = targetUser.name;

        // Log the action for audit purposes
        const log = new AuditLog({
            adminId,
            action: 'PERMANENT_DELETE_USER',
            targetEmail: targetEmail,
            feedback
        });
        await log.save();

        // Perform permanent deletion
        await User.findByIdAndDelete(userId);

        // Send Email Notification
        const adminEmail = process.env.EMAIL_USER || 'admin@alumniportal.com';
        const emailOptions = {
            email: targetEmail,
            subject: 'Account Deletion Notification - Alumni Portal',
            message: `Dear ${targetName},\n\nYour account on the Alumni Management Portal has been permanently deleted by the administrator.\n\nReason: ${feedback}\n\nIf you believe this was done in error or have questions, please contact Admin Support at ${adminEmail}.\n\nThank you,\nAlumni Portal Team`,
            html: `
                <h3>Account Deletion Notification</h3>
                <p>Dear <strong>${targetName}</strong>,</p>
                <p>Your account on the Alumni Management Portal has been permanently deleted by the administrator.</p>
                <p><strong>Reason for deletion:</strong> ${feedback}</p>
                <p>If you believe this was done in error or have questions, please contact Admin Support at <strong>${adminEmail}</strong>.</p>
                <br>
                <p>Thank you,<br>Alumni Portal Team</p>
            `
        };

        await sendEmail(emailOptions);

        res.json({ msg: 'User record permanently deleted and confirmation email sent.' });
    } catch (err) {
        console.error('Delete with Feedback Error:', err.message);
        res.status(500).send('Server Error');
    }
};
// Get all students with filters (Admin only)
exports.getStudents = async (req, res) => {
    try {
        const { search, department, batch, status } = req.query;
        let query = { role: 'student' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { registerNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (department) query.department = department;
        if (batch) query.batch = batch;
        if (status) query.status = status;

        const students = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(students);
    } catch (err) {
        console.error('Get Students Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get single student detail (Admin only)
exports.getStudentById = async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student || student.role !== 'student') {
            return res.status(404).json({ msg: 'Student not found' });
        }
        res.json(student);
    } catch (err) {
        console.error('Get Student Detail Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Update student status (Active/Blocked)
exports.updateStudentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const student = await User.findByIdAndUpdate(
            req.params.id,
            { accountStatus: status },
            { new: true }
        ).select('-password');

        if (!student) return res.status(404).json({ msg: 'Student not found' });

        res.json({ msg: `Student account ${status} successfully`, student });
    } catch (err) {
        console.error('Update Status Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Update student details
exports.updateStudent = async (req, res) => {
    try {
        const student = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!student) return res.status(404).json({ msg: 'Student not found' });

        res.json({ msg: 'Student details updated successfully', student });
    } catch (err) {
        console.error('Update Student Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const student = await User.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        res.json({ msg: 'Student deleted permanently' });
    } catch (err) {
        console.error('Delete Student Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get all alumni with filters (Admin only)
exports.getAlumni = async (req, res) => {
    try {
        const { search, department, status, isVerified } = req.query;
        let query = { role: 'alumni' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (department) query.department = department;
        if (status) query.accountStatus = status;

        if (isVerified === 'true') {
            query.approvalStatus = 'approved';
        } else if (isVerified === 'false') {
            query.approvalStatus = 'pending';
        }

        const alumni = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        const normalizedAlumni = alumni.map(a => {
            const alumniObj = a.toObject();
            return {
                ...alumniObj,
                isVerified: alumniObj.approvalStatus === 'approved'
            };
        });

        res.json(normalizedAlumni);
    } catch (err) {
        logToFile(`❌ getAlumni ERROR: ${err.message}\n${err.stack}`);
        res.status(500).send('Server Error');
    }
};

// Get single alumni detail (Admin only)
exports.getAlumniById = async (req, res) => {
    try {
        const alumni = await User.findById(req.params.id).select('-password');
        if (!alumni || alumni.role !== 'alumni') {
            return res.status(404).json({ msg: 'Alumni not found' });
        }
        res.json(alumni);
    } catch (err) {
        console.error('Get Alumni Detail Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Update alumni details
exports.updateAlumni = async (req, res) => {
    try {
        const alumni = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        ).select('-password');

        if (!alumni) return res.status(404).json({ msg: 'Alumni not found' });

        res.json({ msg: 'Alumni details updated successfully', alumni });
    } catch (err) {
        console.error('Update Alumni Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get mentorships for an alumni (Admin only)
exports.getAlumniMentorships = async (req, res) => {
    try {
        const mentorships = await Mentorship.find({ alumni: req.params.id })
            .populate('student', 'name email department graduationYear')
            .sort({ createdAt: -1 });
        res.json(mentorships);
    } catch (err) {
        console.error('Get Alumni Mentorships Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// Get mentorship for a student (Admin only)
exports.getStudentMentorship = async (req, res) => {
    try {
        const mentorship = await Mentorship.findOne({
            student: req.params.id,
            status: 'accepted'
        })
            .populate('alumni', 'name email profile currentCompany jobRole')
            .populate('student', 'name email department batch');
        res.json(mentorship);
    } catch (err) {
        console.error('Get Student Mentorship Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// End/Remove mentorship (Admin only)
exports.endStudentMentorship = async (req, res) => {
    try {
        const { mentorshipId } = req.body;
        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) {
            return res.status(404).json({ msg: 'Mentorship not found' });
        }

        mentorship.status = 'removed';
        // Clear all chat messages to ensure fresh start with new mentor
        mentorship.messages = [];
        await mentorship.save();

        res.json({ msg: 'Mentorship ended successfully', mentorship });
    } catch (err) {
        console.error('End Student Mentorship Error:', err.message);
        res.status(500).send('Server Error');
    }
};
// Get all mentorships with filters (Admin only)
exports.getAllMentorships = async (req, res) => {
    try {
        const { status, studentDept, search } = req.query;
        let query = {};

        if (status) query.status = status;

        // Perform population first to allow filtering by populated fields if needed
        // However, for simplicity, we'll fetch all and filter in memory or use complex lookups
        // Using basic find and populate for now
        let mentorships = await Mentorship.find(query)
            .populate('student', 'name email department batch')
            .populate('alumni', 'name email department profile currentCompany jobRole')
            .sort({ createdAt: -1 });

        // Apply manual search filter if provided
        if (search) {
            const searchLower = search.toLowerCase();
            mentorships = mentorships.filter(m =>
                m.student?.name?.toLowerCase().includes(searchLower) ||
                m.alumni?.name?.toLowerCase().includes(searchLower) ||
                m.mentorshipTopic?.toLowerCase().includes(searchLower)
            );
        }

        if (studentDept) {
            mentorships = mentorships.filter(m => m.student?.department === studentDept);
        }

        res.json(mentorships);
    } catch (err) {
        console.error('Get All Mentorships Error:', err.message);
        res.status(500).send('Server Error');
    }
};
