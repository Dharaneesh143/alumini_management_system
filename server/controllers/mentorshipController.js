const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer for Chat Media
const chatStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/chat/docs';
        if (file.mimetype.startsWith('image/')) folder = 'uploads/chat/images';
        else if (file.mimetype.startsWith('audio/')) folder = 'uploads/chat/voice';
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        cb(null, `chat-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadChat = multer({
    storage: chatStorage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

exports.uploadChatMiddleware = uploadChat;

// Request Mentorship
exports.requestMentorship = async (req, res) => {
    try {
        const { alumniId, message, mentorshipTopic } = req.body;
        const studentId = req.user.id;

        const alumni = await User.findById(alumniId);
        if (!alumni || alumni.role !== 'alumni') {
            return res.status(404).json({ msg: 'Alumni not found' });
        }
        if (!alumni.isMentor) {
            return res.status(403).json({ msg: 'This alumni is not currently available for mentorship' });
        }

        const activeMenteesCount = await Mentorship.countDocuments({
            alumni: alumniId,
            status: 'accepted'
        });
        if (activeMenteesCount >= (alumni.mentorSettings?.capacity || 3)) {
            return res.status(400).json({ msg: 'Mentor has reached maximum student capacity' });
        }

        const hasActiveMentor = await Mentorship.findOne({
            student: studentId,
            status: 'accepted'
        });
        if (hasActiveMentor) {
            return res.status(400).json({ msg: 'You already have an active mentor. You can only have one at a time.' });
        }

        const existingRequest = await Mentorship.findOne({
            student: studentId,
            alumni: alumniId,
            status: 'pending'
        });
        if (existingRequest) {
            return res.status(400).json({ msg: 'You already have a pending request for this mentor' });
        }

        const student = await User.findById(studentId);
        const resumeUrl = student?.profile?.resumeUrl || null;

        const newRequest = new Mentorship({
            student: studentId,
            alumni: alumniId,
            message,
            mentorshipTopic,
            resumeUrl
        });

        await newRequest.save();
        res.status(201).json(newRequest);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Requests (for Alumni or Student)
exports.getMentorshipRequests = async (req, res) => {
    try {
        let requests;
        if (req.user.role === 'alumni') {
            requests = await Mentorship.find({ alumni: req.user.id })
                .populate('student', 'name email profile')
                .sort({ createdAt: -1 });
        } else {
            requests = await Mentorship.find({ student: req.user.id })
                .populate('alumni', 'name email profile currentCompany jobRole mentorSettings')
                .sort({ createdAt: -1 });
        }

        const sanitizedRequests = requests.map(reqDoc => {
            const r = reqDoc.toObject();
            if (req.user.role === 'alumni' && r.status === 'pending') {
                delete r.resumeUrl;
                if (r.student && r.student.profile) delete r.student.profile.resumeUrl;
            }
            return r;
        });

        res.json(sanitizedRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Request Status (for Alumni)
exports.updateRequestStatus = async (req, res) => {
    try {
        const { requestId, status, response } = req.body;

        if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Only alumni or administrators can update request status' });
        }

        let mentorship = await Mentorship.findById(requestId);
        if (!mentorship) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        if (req.user.role !== 'admin' && mentorship.alumni.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        mentorship.status = status;
        if (response) mentorship.response = response;

        // If status is changed to 'removed', clear all chat messages
        if (status === 'removed') {
            mentorship.messages = [];
            console.log(`Mentorship ${requestId} marked as removed - chat history cleared`);
        }

        // If status is changed to 'rejected'
        if (status === 'rejected') {
            console.log(`Mentorship ${requestId} marked as rejected`);
        }

        await mentorship.save();
        res.json(mentorship);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Send a Message in Conversation
exports.sendMessage = async (req, res) => {
    try {
        const { mentorshipId, text, type, transcription } = req.body;
        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) return res.status(404).json({ msg: 'Mentorship not found' });

        if (mentorship.student.toString() !== req.user.id && mentorship.alumni.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (mentorship.status !== 'accepted') {
            return res.status(400).json({ msg: 'Mentorship is not active. Cannot send messages to pending, rejected, or removed mentorships.' });
        }

        const newMessage = {
            sender: req.user.id,
            text,
            type: type || 'text',
            readBy: [req.user.id]
        };

        if (req.file) {
            newMessage.fileUrl = req.file.path.replace(/\\/g, '/');
            newMessage.fileName = req.file.originalname;
        }

        if (transcription) {
            newMessage.transcription = transcription;
        }

        mentorship.messages.push(newMessage);
        mentorship.lastMessageAt = Date.now();

        await mentorship.save();
        res.json(mentorship.messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Conversation Details
exports.getConversation = async (req, res) => {
    try {
        const mentorship = await Mentorship.findById(req.params.id)
            .populate('student', 'name email profile')
            .populate('alumni', 'name email profile currentCompany jobRole');

        if (!mentorship) return res.status(404).json({ msg: 'Mentorship not found' });

        if (mentorship.student._id.toString() !== req.user.id && mentorship.alumni._id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // Prevent access to removed mentorships
        if (mentorship.status === 'removed') {
            return res.status(403).json({ msg: 'This mentorship has been ended. Please find a new mentor.' });
        }

        res.json(mentorship);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Read Status
exports.markAsRead = async (req, res) => {
    try {
        const { mentorshipId } = req.body;
        const mentorship = await Mentorship.findById(mentorshipId);
        if (!mentorship) return res.status(404).json({ msg: 'Mentorship not found' });

        let updated = false;
        mentorship.messages.forEach(msg => {
            if (!msg.readBy.includes(req.user.id)) {
                msg.readBy.push(req.user.id);
                updated = true;
            }
        });

        if (updated) await mentorship.save();
        res.json({ msg: 'Marked as read' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Toggle Mute
exports.toggleMute = async (req, res) => {
    try {
        const mentorship = await Mentorship.findById(req.params.id);
        if (!mentorship) return res.status(404).json({ msg: 'Mentorship not found' });

        const index = mentorship.isMutedBy.indexOf(req.user.id);
        if (index === -1) {
            mentorship.isMutedBy.push(req.user.id);
        } else {
            mentorship.isMutedBy.splice(index, 1);
        }

        await mentorship.save();
        res.json(mentorship);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Toggle Archive
exports.toggleArchive = async (req, res) => {
    try {
        const mentorship = await Mentorship.findById(req.params.id);
        if (!mentorship) return res.status(404).json({ msg: 'Mentorship not found' });

        const index = mentorship.isArchivedBy.indexOf(req.user.id);
        if (index === -1) {
            mentorship.isArchivedBy.push(req.user.id);
        } else {
            mentorship.isArchivedBy.splice(index, 1);
        }

        await mentorship.save();
        res.json(mentorship);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add Private Mentor Note
exports.addMentorNote = async (req, res) => {
    try {
        const { mentorshipId, text } = req.body;
        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) return res.status(404).json({ msg: 'Mentorship not found' });
        if (mentorship.alumni.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Only the mentor can add notes' });
        }

        mentorship.mentorNotes.push({ text });
        await mentorship.save();
        res.json(mentorship.mentorNotes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const { mentorshipId, messageId } = req.params;
        const mentorship = await Mentorship.findById(mentorshipId);

        if (!mentorship) return res.status(404).json({ msg: 'Mentorship not found' });

        // Find the message index
        const messageIndex = mentorship.messages.findIndex(m => m._id.toString() === messageId);

        if (messageIndex === -1) {
            return res.status(404).json({ msg: 'Message not found' });
        }

        // Check if user is the sender of the message
        if (mentorship.messages[messageIndex].sender.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete this message' });
        }

        // Remove the message
        mentorship.messages.splice(messageIndex, 1);
        await mentorship.save();

        res.json(mentorship.messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
