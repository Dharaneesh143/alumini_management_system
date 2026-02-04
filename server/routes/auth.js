const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Login user & get token
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/admin-login
// @desc    Admin Login
// @access  Public
router.post('/admin-login', authController.adminLogin);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth'), authController.getMe);

module.exports = router;
