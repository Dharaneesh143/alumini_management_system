require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function inspectData() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const latestEvents = await Event.find().sort({ createdAt: -1 }).limit(3).lean();
    
    console.log('--- LATEST 3 EVENTS ---');
    latestEvents.forEach((e, i) => {
        console.log(`\nEvent ${i+1}:`);
        console.log(JSON.stringify(e, null, 2));
    });
    
    await mongoose.disconnect();
    process.exit(0);
}

inspectData().catch(err => {
    console.error(err);
    process.exit(1);
});
