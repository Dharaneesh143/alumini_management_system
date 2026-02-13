const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

async function checkStudents() {
    try {
        console.log('Connecting to:', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const studentCount = await User.countDocuments({ role: 'student' });
        console.log(`Total students in DB: ${studentCount}`);

        const allUsers = await User.find({}).limit(5).select('name role email');
        console.log('Sample Users (any role):', allUsers.map(u => `${u.name} (${u.role})`));

        if (studentCount > 0) {
            const sample = await User.findOne({ role: 'student' });
            console.log('Sample Student Details:', {
                name: sample.name,
                role: sample.role,
                accountStatus: sample.accountStatus,
                status: sample.status,
                department: sample.department,
                batch: sample.batch,
                registerNumber: sample.registerNumber
            });
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkStudents();
