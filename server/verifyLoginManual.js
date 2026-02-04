require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const verifyUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alumni_portal');
        console.log('MongoDB Connected');

        const usersToCheck = [
            { email: 'admin@alumni.com', role: 'admin' },
            { email: 'alumni@alumni.com', role: 'alumni' },
            { email: 'student@alumni.com', role: 'student' }
        ];
        const password = 'password123';

        for (const u of usersToCheck) {
            const user = await User.findOne({ email: u.email });

            console.log(`\nChecking ${u.role} (${u.email})...`);
            if (!user) {
                console.log('User not found!');
            } else {
                const isMatch = await bcrypt.compare(password, user.password);
                console.log('User found in DB.');
                console.log('Password match result:', isMatch);
            }
        }

        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
};

verifyUser();
