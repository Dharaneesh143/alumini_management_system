const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for presentation uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/events';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `event-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|ppt|pptx|doc|docx/;
        const mimetypes = /application\/pdf|application\/vnd.ms-powerpoint|application\/vnd.openxmlformats-officedocument.presentationml.presentation|application\/msword|application\/vnd.openxmlformats-officedocument.wordprocessingml.document/;

        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = mimetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb('Error: Only PDF, PPT, and DOC files are allowed!');
        }
    }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Admin
router.post('/', [auth, adminAuth], eventController.createEvent);

// @route   GET /api/events
// @desc    Get all events
// @access  Auth
router.get('/', auth, eventController.getEvents);

// @route   GET /api/events/stats/analytics
// @desc    Get event analytics
// @access  Admin
router.get('/stats/analytics', [auth, adminAuth], eventController.getEventStats);

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Auth
router.get('/:id', auth, eventController.getEventById);

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Admin
router.put('/:id', [auth, adminAuth], eventController.updateEvent);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Admin
router.delete('/:id', [auth, adminAuth], eventController.deleteEvent);

// @route   POST /api/events/:id/register
// @desc    Register for an event
// @access  Auth
router.post('/:id/register', auth, eventController.registerForEvent);

// @route   POST /api/events/:id/presentation
// @desc    Upload presentation
// @access  Auth (Admin or Speaker)
router.post('/:id/presentation', [auth, upload.single('presentation')], eventController.uploadPresentation);

// @route   POST /api/events/:id/feedback
// @desc    Add feedback
// @access  Auth
router.post('/:id/feedback', auth, eventController.addFeedback);

module.exports = router;


// @route   GET /api/events/alumni/requests
// @access  Private (Alumni)
router.get('/alumni/requests', auth, eventController.getAlumniRequests);

// @route   PUT /api/events/:id/schedule
// @access  Private (Alumni)
router.put('/:id/schedule', auth, eventController.scheduleEvent);
