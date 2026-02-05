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

// Stats & Discovery (New)
router.get('/stats', studentController.getDashboardStats);
router.get('/alumni-discovery', studentController.getVerifiedAlumni);

// Resume (New)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/resumes'),
    filename: (req, file, cb) => cb(null, `resume-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') return cb(null, true);
        cb(new Error('Only PDF allowed'));
    }
});
router.post('/resume', upload.single('resume'), studentController.uploadResume);

module.exports = router;
