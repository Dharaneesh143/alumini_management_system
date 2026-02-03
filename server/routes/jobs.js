const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');

// @route   POST api/jobs
// @desc    Create a job posting
// @access  Private (Alumni)
router.post('/', auth, jobController.createJob);

// @route   GET api/jobs
// @desc    Get all jobs
// @access  Private
router.get('/', auth, jobController.getJobs);

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Private
router.get('/:id', auth, jobController.getJobById);

// @route   POST api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private (Student)
router.post('/:id/apply', auth, jobController.applyJob);

module.exports = router;
