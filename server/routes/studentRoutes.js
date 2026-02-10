const express = require('express');
const router = express.Router();
const studentAuthController = require('../controllers/studentAuthController');
const studentController = require('../controllers/studentController');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Config for Resumes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resumes');
    },
    filename: (req, file, cb) => {
        cb(null, `resume-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Only PDF files are allowed!'));
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// @route   POST api/student/signup
router.post('/signup', studentAuthController.signup);

// @route   POST api/student/login
router.post('/login', studentAuthController.login);

// @route   GET api/student/stats
// @access  Private (Student)
router.get('/stats', auth, studentController.getDashboardStats);

// @route   GET api/student/alumni
// @access  Private (Student)
router.get('/alumni', auth, studentController.getVerifiedAlumni);

// @route   GET api/student/alumni-discovery
// @access  Private (Student) - Alias for alumni endpoint
router.get('/alumni-discovery', auth, studentController.getVerifiedAlumni);

// @route   POST api/student/resume
// @access  Private (Student)
router.post('/resume', auth, upload.single('resume'), studentController.uploadResume);

module.exports = router;
