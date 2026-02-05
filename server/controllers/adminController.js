const User = require('../models/User');
const Admin = require('../models/Admin');
const Job = require('../models/Job');
const AuditLog = require('../models/AuditLog');

// Get system statistics
exports.getSystemStats = async (req, res) => {
    try {
        const totalAdmins = await Admin.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalAlumni = await User.countDocuments({ role: 'alumni' });
        const verifiedAlumni = await User.countDocuments({ role: 'alumni', approvalStatus: 'approved' });
        const pendingAlumni = await User.countDocuments({ role: 'alumni', approvalStatus: 'pending' });
        const totalJobs = await Job.countDocuments();

        res.json({
            totalUsers: totalAdmins + totalStudents + totalAlumni,
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
        let filter = {};

        if (role) {
            filter.role = role;
        }

        if (isVerified === 'true') {
            filter.approvalStatus = 'approved';
        } else if (isVerified === 'false') {
            filter.approvalStatus = 'pending';
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

// Deactivate/Delete user
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

// Delete user with feedback
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

        const log = new AuditLog({
            adminId,
            action: 'DELETE_USER',
            targetEmail: targetUser.email,
            feedback
        });
        await log.save();

        await User.findByIdAndDelete(userId);

        res.json({ msg: 'User deleted and feedback recorded' });
    } catch (err) {
        console.error(err.message);
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
        if (status) query.accountStatus = status;

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
const Mentorship = require('../models/Mentorship');
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
