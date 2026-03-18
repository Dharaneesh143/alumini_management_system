const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, userController.getMe);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @route   GET api/users
// @desc    Get all users (Network)
// @access  Private (or Public based on requirements)
router.get('/', auth, userController.getAllUsers);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, userController.getUserById);

// @route   POST api/users/deactivate
// @desc    Deactivate current user account
// @access  Private
router.post('/deactivate', auth, userController.deactivateMe);

// @route   POST api/users/resume-upload
// @desc    Upload resume to Cloudinary
// @access  Private
router.post('/resume-upload', auth, upload.single('resume'), userController.uploadResume);

module.exports = router;
