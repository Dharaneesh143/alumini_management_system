const Event = require('../models/Event');
const User = require('../models/User');
const Invitation = require('../models/Invitation');
const EventRegistration = require('../models/EventRegistration');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            date,
            time,
            venue,
            mode,
            speaker,
            department,
            maxParticipants,
            requestDetails,
            organizer,
            duration,
            meetingLink,
            imageUrl,
            category
        } = req.body;

        // Role-based restrictions
        if (req.user.role === 'alumni' && !['Hackathon', 'Company'].includes(type)) {
            return res.status(400).json({ msg: 'Alumni can only create Hackathon or Company events' });
        }
        if (req.user.role === 'admin' && type !== 'College Event') {
            return res.status(400).json({ msg: 'Admin can only create College Events' });
        }

        // If it's a request to alumni, set status to Pending, otherwise Upcoming
        const status = (speaker?.alumniId && !date) ? 'Pending' : 'Upcoming';

        const event = new Event({
            title,
            description,
            type,
            date,
            time,
            venue,
            mode: mode || 'Online',
            speaker,
            department,
            maxParticipants,
            status,
            requestDetails,
            organizer: organizer || (req.user.role === 'admin' ? 'College Admin' : req.user.name),
            duration,
            meetingLink,
            imageUrl,
            category,
            organized_by: req.user.role === 'admin' ? 'Admin' : 'Alumni',
            createdBy: req.user.id
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error('Create Event Error:', err.message);
        res.status(500).send('Server Error: ' + err.message);
    }
};

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
    try {
        const { type, category, department, status, search, alumniId } = req.query;
        let query = {};

        // Use type or category (alias)
        const eventType = type || category;
        if (eventType) query.type = eventType;
        
        if (department) query.department = department;
        if (status) query.status = status;
        
        // Validate alumniId to prevent CastError
        if (alumniId && alumniId !== 'undefined' && alumniId !== 'null') {
            const mongoose = require('mongoose');
            if (mongoose.Types.ObjectId.isValid(alumniId)) {
                query['speaker.alumniId'] = alumniId;
            }
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { organizer: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(query)
            .populate('speaker.alumniId', 'name currentCompany jobRole')
            .sort({ date: -1 });

        res.json(events);
    } catch (err) {
        console.error('Get Events Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('speaker.alumniId', 'name currentCompany jobRole')
            .populate('registeredParticipants.user', 'name role email department batch');

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        console.error('Get Event Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(event);
    } catch (err) {
        console.error('Update Event Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Event removed' });
    } catch (err) {
        console.error('Delete Event Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // REFINEMENT: Students can ONLY register for Company events
        if (req.user.role === 'student' && event.type !== 'Company') {
            return res.status(403).json({ msg: 'Students can only register for Company events' });
        }

        // Check if user is already registered
        const isRegistered = event.registeredParticipants.some(
            p => p.user.toString() === req.user.id
        );

        if (isRegistered) {
            return res.status(400).json({ msg: 'User already registered for this event' });
        }

        // Check capacity
        if (event.registeredParticipants.length >= event.maxParticipants) {
            return res.status(400).json({ msg: 'Event is at full capacity' });
        }

        // 1. Update Event model array (for quick access)
        event.registeredParticipants.push({
            user: req.user.id,
            role: req.user.role
        });
        await event.save();

        // 2. Create entry in EventRegistration collection (requirement 5)
        const registration = new EventRegistration({
            event_id: event._id,
            student_id: req.user.id,
            registration_date: Date.now(),
            attendance_status: 'Pending'
        });
        await registration.save();

        res.json({ msg: 'Registration successful', event, registration_id: registration._id });
    } catch (err) {
        console.error('Event Registration Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Upload presentation for an event
// @route   POST /api/events/:id/presentation
// @access  Private (Admin or Speaker)
exports.uploadPresentation = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Check if user is admin or the assigned speaker (if speaker is alumni)
        const isAdmin = req.user.role === 'admin';
        const isSpeaker = event.speaker.alumniId && event.speaker.alumniId.toString() === req.user.id;

        if (!isAdmin && !isSpeaker) {
            return res.status(403).json({ msg: 'Not authorized to upload presentations for this event' });
        }

        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        event.presentations.push({
            fileName: req.file.originalname,
            fileUrl: req.file.path,
            uploadedBy: req.user.id
        });

        await event.save();
        res.json({ msg: 'Presentation uploaded successfully', event });
    } catch (err) {
        console.error('Presentation Upload Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add feedback for an event
// @route   POST /api/events/:id/feedback
// @access  Private
exports.addFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ msg: 'Event not found' });
        }

        // Check if user attended/registered (optional but recommended)
        const isRegistered = event.registeredParticipants.some(
            p => p.user.toString() === req.user.id
        );

        if (!isRegistered && req.user.role !== 'admin') {
            return res.status(400).json({ msg: 'Only registered participants can leave feedback' });
        }

        event.feedback.push({
            user: req.user.id,
            rating,
            comment
        });

        await event.save();
        res.json({ msg: 'Feedback added successfully', event });
    } catch (err) {
        console.error('Add Feedback Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get event statistics
// @route   GET /api/events/stats/analytics
// @access  Private/Admin
exports.getEventStats = async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const upcomingEvents = await Event.countDocuments({ status: 'Upcoming' });
        const completedEvents = await Event.countDocuments({ status: 'Completed' });

        // Registration trends (by month for last 6 events)
        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(6)
            .select('title registeredParticipants');

        const analytics = recentEvents.map(e => ({
            name: e.title,
            count: e.registeredParticipants.length
        }));

        res.json({
            totalEvents,
            upcomingEvents,
            completedEvents,
            analytics
        });
    } catch (err) {
        console.error('Get Event Stats Error:', err.message);
        res.status(500).send('Server Error');
    }
};


// @desc    Get event requests for alumni
exports.getAlumniRequests = async (req, res) => {
    try {
        const requests = await Event.find({ 'speaker.alumniId': req.user.id, status: 'Pending' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        console.error('Get Alumni Requests Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Schedule an event (Alumni accepts request)
exports.scheduleEvent = async (req, res) => {
    try {
        const { date, time, venue, mode } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        if (event.speaker.alumniId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        event.date = date;
        event.time = time;
        event.venue = venue;
        event.mode = mode || 'Online';
        event.status = 'Upcoming';
        await event.save();
        res.json(event);
    } catch (err) {
        console.error('Schedule Event Error:', err.message);
        res.status(500).send('Server Error');
    }
};
// @desc    Admin invites alumni to an event
// @route   POST /api/events/:id/invite
// @access  Private/Admin
exports.inviteAlumni = async (req, res) => {
    try {
        const { alumniIds } = req.body;
        const eventId = req.params.id;

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ msg: 'Event not found' });

        const invitations = alumniIds.map(alumniId => ({
            eventId,
            alumniId,
            status: 'pending'
        }));

        // Using insertMany with ordered: false to skip duplicates if any
        await Invitation.insertMany(invitations, { ordered: false }).catch(err => {
            console.log('Some invitations might be duplicates');
        });

        res.json({ msg: 'Invitations sent successfully' });
    } catch (err) {
        console.error('Invite Alumni Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get current alumni invitations
// @route   GET /api/events/invitations/me
// @access  Private (Alumni)
exports.getAlumniInvitations = async (req, res) => {
    try {
        const invitations = await Invitation.find({ alumniId: req.user.id })
            .populate('eventId')
            .sort({ invitedAt: -1 });
        res.json(invitations);
    } catch (err) {
        console.error('Get Invitations Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Alumni responds to an invitation
// @route   PUT /api/events/invitations/:id
// @access  Private (Alumni)
exports.respondToInvitation = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ msg: 'Invalid status' });
        }

        const invitation = await Invitation.findOne({ _id: req.params.id, alumniId: req.user.id });
        if (!invitation) return res.status(404).json({ msg: 'Invitation not found' });

        invitation.status = status;
        invitation.respondedAt = Date.now();
        await invitation.save();

        if (status === 'accepted') {
            // Logic for when alumni accepts - maybe add them to some list or update event
            const event = await Event.findById(invitation.eventId);
            if (event) {
                // If the event didn't have a speaker set, we could set it here
                // or just leave it for the alumni to show up in "My Events"
                console.log(`Alumni ${req.user.id} accepted invite for ${event.title}`);
            }
        }

        res.json(invitation);
    } catch (err) {
        console.error('Respond Invitation Error:', err.message);
        res.status(500).send('Server Error');
    }
};
