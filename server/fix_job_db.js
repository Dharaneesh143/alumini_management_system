const mongoose = require('mongoose');
const Job = require('./models/Job');
const User = require('./models/User');
require('dotenv').config();

const fixDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const jobs = await Job.find({});
        console.log(`Found ${jobs.length} jobs to scan...`);

        for (let job of jobs) {
            let updated = false;

            // 1. Fix Status
            if (!job.status) {
                job.status = 'active';
                updated = true;
            }

            // 2. Fix appliedCount
            if (job.appliedCount === undefined) {
                job.appliedCount = job.applicants ? job.applicants.length : 0;
                updated = true;
            }

            // 3. Fix postedByRole (CRITICAL: Required field)
            if (!job.postedByRole) {
                // Try to determine the role of the poster
                const poster = await User.findById(job.postedBy);
                if (poster) {
                    job.postedByRole = poster.role; // Usually 'alumni' or 'admin'
                } else {
                    job.postedByRole = 'alumni'; // Fallback
                }
                updated = true;
            }

            if (updated) {
                await job.save();
                console.log(`✅ Fixed Job: ${job.title} (${job._id})`);
            }
        }

        console.log('Database fix complete.');
        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
};

fixDatabase();
