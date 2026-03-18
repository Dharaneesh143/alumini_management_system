const mongoose = require('mongoose');
require('dotenv').config();
const Mentorship = require('./models/Mentorship');
const User = require('./models/User');

async function fixBrokenLinks() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        // Null out resumeUrl in Mentorship collection if it's a local path
        const result1 = await Mentorship.updateMany(
            { resumeUrl: { $regex: /^\/uploads/ } },
            { $set: { resumeUrl: null } }
        );
        console.log(`Updated ${result1.modifiedCount} mentorship requests.`);

        // Null out resumeUrl and profile.resumeUrl in User collection
        const result2 = await User.updateMany(
            { 
                $or: [
                    { resumeUrl: { $regex: /^\/uploads/ } },
                    { resume: { $regex: /^\/uploads/ } },
                    { 'profile.resumeUrl': { $regex: /^\/uploads/ } }
                ]
            },
            { 
                $set: { 
                    resumeUrl: null,
                    resume: null,
                    'profile.resumeUrl': null
                } 
            }
        );
        console.log(`Updated ${result2.modifiedCount} users. Removed local resume paths.`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

fixBrokenLinks();
