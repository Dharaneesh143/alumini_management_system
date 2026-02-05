const express = require('express');
const router = express.Router();
const alumniAuthController = require('../controllers/alumniAuthController');

// @route   POST api/alumni/signup
router.post('/signup', alumniAuthController.signup);

// @route   POST api/alumni/login
router.post('/login', alumniAuthController.login);

module.exports = router;
