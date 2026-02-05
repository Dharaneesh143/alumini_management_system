const Job = require('../models/Job');

// Create a Job (Alumni only - check in route)
exports.createJob = async (req, res) => {
    try {
        const { title, description, company, location, type } = req.body;

        const newJob = new Job({
            title,
            description,
            company,
            location,
            type,
            postedBy: req.user.id
        });

        const job = await newJob.save();
        res.json(job);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get All Jobs
exports.getJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }).populate('postedBy', 'name');
        res.json(jobs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get Job by ID
exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('postedBy', 'name');
        if (!job) return res.status(404).json({ msg: 'Job not found' });
        res.json(job);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Job not found' });
        res.status(500).send('Server Error');
    }
};

// Apply for a Job (Student only)
exports.applyJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ msg: 'Job not found' });

        // Check if already applied
        const alreadyApplied = job.applicants.some(applicant => applicant.user.toString() === req.user.id);
        console.log(`Debug: User ${req.user.id} applying for job ${req.params.id}. Already applied: ${alreadyApplied}`);

        if (alreadyApplied) {
            return res.status(400).json({ msg: 'Already applied' });
        }

        job.applicants.unshift({ user: req.user.id });
        await job.save();

        res.json(job.applicants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
