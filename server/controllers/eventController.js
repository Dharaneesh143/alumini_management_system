const Event = require('../models/Event');
const User = require('../models/User');

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
            speaker,
            department,
            maxParticipants
        } = req.body;

        const event = new Event({
            title,
            description,
            type,
            date,
            time,
            venue,
            speaker,
            department,
            maxParticipants,
            createdBy: req.user.id
        });

        await event.save();
        res.status(201).json(event);
    } catch (err) {
        console.error('Create Event Error:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all events with filters
// @route   GET /api/events
// @access  Private
exports.getEvents = async (req, res) => {
    try {
        const { type, department, status, search } = req.query;
        let query = {};

        if (type) query.type = type;
        if (department) query.department = department;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
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

        event.registeredParticipants.push({
            user: req.user.id,
            role: req.user.role
        });

        await event.save();
        res.json({ msg: 'Registration successful', event });
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
            fileUrl: `/uploads/events/${req.file.filename}`,
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
