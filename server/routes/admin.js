const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// @route   GET api/admin/stats
// @desc    Get system statistics
// @access  Admin only
router.get('/stats', adminAuth, adminController.getSystemStats);

// @route   GET api/admin/users
// @desc    Get all users with filters
// @access  Admin only
router.get('/users', adminAuth, adminController.getAllUsers);

// @route   POST api/admin/verify-alumni
// @desc    Verify or reject alumni
// @access  Admin only
router.post('/verify-alumni', adminAuth, adminController.verifyAlumni);

// @route   DELETE api/admin/users/:userId
// @desc    Deactivate user
// @access  Admin only
router.delete('/users/:userId', adminAuth, adminController.deactivateUser);

module.exports = router;
