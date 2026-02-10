const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

const migrateJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Update all jobs that don't have a status field or have it as empty/null
        const result = await Job.updateMany(
            { status: { $exists: false } }, // Or filter to set all to active if preferred
            { $set: { status: 'active' } }
        );

        console.log(`Migration complete. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        // Also ensure appliedCount is initialized for existing jobs
        const countResult = await Job.updateMany(
            { appliedCount: { $exists: false } },
            { $set: { appliedCount: 0 } }
        );
        console.log(`Initialized appliedCount for ${countResult.modifiedCount} jobs.`);

        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrateJobs();
