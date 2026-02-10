const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumniController');
const auth = require('../middleware/auth');

// Middleware to ensure user is alumni
const checkAlumni = (req, res, next) => {
    if (req.user.role !== 'alumni') {
        return res.status(403).json({ msg: 'Access denied. Alumni only.' });
    }
    next();
};

// Apply auth and checkAlumni to all routes
router.use(auth);
// router.use(checkAlumni); // Uncomment to enforce strict role check

// Profile Routes
router.get('/profile', alumniController.getProfile);
router.put('/profile', alumniController.updateProfile);
router.get('/stats', alumniController.getAlumniStats);


// Job Routes
router.post('/jobs', alumniController.postJob);
router.get('/jobs', alumniController.getMyJobs);
router.get('/jobs/:jobId/applicants', alumniController.getJobApplicants);

module.exports = router;
