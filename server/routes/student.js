const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');

// Middleware to ensure user is student (optional strictly, but good practice)
const checkStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ msg: 'Access denied. Student only.' });
    }
    next();
};

// Apply auth and checkStudent to all routes
router.use(auth);
// router.use(checkStudent); // Uncomment to enforce strict role check

// Profile Routes
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

// Job Routes
router.get('/jobs', studentController.getJobs);
router.post('/jobs/apply/:jobId', studentController.applyForJob);
router.get('/applications', studentController.getAppliedJobs);

module.exports = router;
