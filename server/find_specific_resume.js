const mongoose = require('mongoose');
require('dotenv').config();

async function findSpecificResume() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        
        const filename = 'resume-1773830247776-180629337.pdf';
        
        // Search in all collections and fields
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        
        for (const col of collections) {
            const results = await db.collection(col.name).find({
                $or: [
                    { resumeUrl: { $regex: filename } },
                    { resume: { $regex: filename } },
                    { fileUrl: { $regex: filename } },
                    { 'profile.resumeUrl': { $regex: filename } },
                    { 'messages.fileUrl': { $regex: filename } },
                    { 'applicants.resumeUrl': { $regex: filename } }
                ]
            }).toArray();
            
            if (results.length > 0) {
                console.log(`Found in collection ${col.name}:`, results.length, 'records');
                results.forEach(r => console.log(' - ID:', r._id));
            }
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findSpecificResume();
