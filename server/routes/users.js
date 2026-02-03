const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

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

module.exports = router;
