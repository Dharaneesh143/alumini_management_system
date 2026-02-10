const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const checkJobOwnership = require('../middleware/checkJobOwnership');

// @route   POST api/jobs
// @desc    Create a job posting (Alumni/Admin)
router.post('/', auth, upload.fields([
    { name: 'companyLogo', maxCount: 1 },
    { name: 'jdPdf', maxCount: 1 }
]), jobController.createJob);

// @route   GET api/jobs
// @desc    Get all jobs
router.get('/', auth, jobController.getJobs);

// @route   GET api/jobs/:id
router.get('/:id', auth, jobController.getJobById);

// @route   PUT api/jobs/:id
router.put('/:id', auth, checkJobOwnership, jobController.updateJob);

// @route   DELETE api/jobs/:id
router.delete('/:id', auth, checkJobOwnership, jobController.deleteJob);

// @route   GET api/jobs/:id/applicants
router.get('/:id/applicants', auth, checkJobOwnership, jobController.getJobApplicants);

// @route   POST api/jobs/:id/apply
router.post('/:id/apply', auth, upload.single('resume'), jobController.applyJob);

// @route   PATCH api/jobs/applications/:id/status
router.patch('/applications/:id/status', auth, jobController.updateApplicationStatus);

// @route   PATCH api/jobs/:id/approve
router.patch('/:id/approve', auth, jobController.approveJob);

module.exports = router;
