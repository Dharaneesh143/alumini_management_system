const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// @route   GET api/admin/stats
// @desc    Get system statistics
// @access  Admin only
router.get('/stats', adminAuth, adminController.getSystemStats);

// @route   GET api/admin/activity
// @desc    Get recent system activity
// @access  Admin only
router.get('/activity', adminAuth, adminController.getRecentActivity);

// @route   GET api/admin/users
// @desc    Get all users with filters
// @access  Admin only
router.get('/users', adminAuth, adminController.getAllUsers);

// @route   POST api/admin/verify-alumni
// @desc    Verify or reject alumni
// @access  Admin only
router.post('/verify-alumni', adminAuth, adminController.verifyAlumni);

// @route   POST api/admin/users/:userId/activate
// @desc    Activate user
// @access  Admin only
router.post('/users/:userId/activate', adminAuth, (req, res, next) => {
    console.log('[ROUTE] Activate route matched:', req.params);
    next();
}, adminController.activateUser);

// @route   DELETE api/admin/users/:userId
// @desc    Deactivate user
// @access  Admin only
router.delete('/users/:userId', adminAuth, adminController.deactivateUser);

// @route   POST api/admin/delete-user
// @desc    Delete user with feedback
// @access  Admin only
router.post('/delete-user', adminAuth, adminController.deleteUserWithFeedback);

// --- Student Management Routes ---

// @route   GET api/admin/students
router.get('/students', adminAuth, adminController.getStudents);

// @route   GET api/admin/students/:id
router.get('/students/:id', adminAuth, adminController.getStudentById);

// @route   GET api/admin/alumni
router.get('/alumni', adminAuth, adminController.getAlumni);

// @route   GET api/admin/alumni/:id
router.get('/alumni/:id', adminAuth, adminController.getAlumniById);

// @route   PUT api/admin/students/:id/status
router.put('/students/:id/status', adminAuth, adminController.updateStudentStatus);

// @route   PUT api/admin/students/:id/update
router.put('/students/:id/update', adminAuth, adminController.updateStudent);

// @route   PUT api/admin/alumni/:id/update
router.put('/alumni/:id/update', adminAuth, adminController.updateAlumni);

// @route   DELETE api/admin/students/:id
router.delete('/students/:id', adminAuth, adminController.deleteStudent);

// @route   GET api/admin/alumni/:id/mentorships
router.get('/alumni/:id/mentorships', adminAuth, adminController.getAlumniMentorships);

// @route   GET api/admin/students/:id/mentorship
router.get('/students/:id/mentorship', adminAuth, adminController.getStudentMentorship);

// @route   POST api/admin/students/end-mentorship
router.post('/students/end-mentorship', adminAuth, adminController.endStudentMentorship);

// @route   GET api/admin/mentorships
router.get('/mentorships', adminAuth, adminController.getAllMentorships);

// @route   POST api/admin/handle-deactivation
// @desc    Approve or reject deactivation requests
// @access  Admin only
router.post('/handle-deactivation', adminAuth, adminController.handleDeactivationRequest);

module.exports = router;
