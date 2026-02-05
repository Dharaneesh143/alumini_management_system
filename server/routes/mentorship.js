const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mentorshipController = require('../controllers/mentorshipController');

// @route   POST api/mentorship/request
// @desc    Request mentorship from an alumni
// @access  Private (Student)
router.post('/request', auth, mentorshipController.requestMentorship);

// @route   GET api/mentorship/requests
// @desc    Get mentorship requests for current user
// @access  Private (Alumni/Student)
router.get('/requests', auth, mentorshipController.getMentorshipRequests);

// @route   POST api/mentorship/respond
// @desc    Respond to a mentorship request
// @access  Private (Alumni)
router.post('/respond', auth, mentorshipController.updateRequestStatus);

// @route   GET api/mentorship/conversation/:id
// @desc    Get conversation details
// @access  Private
router.get('/conversation/:id', auth, mentorshipController.getConversation);

// @route   POST api/mentorship/message
// @desc    Send a message in conversation
// @access  Private
router.post('/message', auth, mentorshipController.uploadChatMiddleware, mentorshipController.sendMessage);

// @route   POST api/mentorship/mark-as-read
// @desc    Mark all messages in conversation as read
// @access  Private
router.post('/mark-as-read', auth, mentorshipController.markAsRead);

// @route   PUT api/mentorship/mute/:id
// @desc    Toggle mute for a mentorship
// @access  Private
router.put('/mute/:id', auth, mentorshipController.toggleMute);

// @route   PUT api/mentorship/archive/:id
// @desc    Toggle archive for a mentorship
// @access  Private
router.put('/archive/:id', auth, mentorshipController.toggleArchive);

// @route   POST api/mentorship/notes
// @desc    Add a private mentor note
// @access  Private (Alumni)
router.post('/notes', auth, mentorshipController.addMentorNote);

// @route   DELETE api/mentorship/message/:mentorshipId/:messageId
// @desc    Delete a message
// @access  Private
router.delete('/message/:mentorshipId/:messageId', auth, mentorshipController.deleteMessage);

module.exports = router;
