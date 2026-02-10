const Job = require('../models/Job');

const checkJobOwnership = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ msg: 'Job not found' });
        }

        // Check if user is admin OR the one who posted the job
        // Note: Admin info usually comes from req.admin or req.user.role === 'admin'
        // Assuming req.user is populated by auth middleware

        const isOwner = job.postedBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        console.log(`[Ownership Check] Job: ${job.title}, User: ${req.user.id}, Role: ${req.user.role}, IsOwner: ${isOwner}, IsAdmin: ${isAdmin}`);

        if (!isOwner && !isAdmin) {
            console.log(`[Ownership Check] DENIED for User: ${req.user.id}`);
            return res.status(403).json({ msg: 'User not authorized to manage this job' });
        }

        next();
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Job not found' });
        }
        res.status(500).send('Server Error');
    }
};

module.exports = checkJobOwnership;
