const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const admins = await User.find({ role: 'admin' });
        console.log(`Found ${admins.length} admin(s):`);

        admins.forEach(admin => {
            console.log(`- Name: ${admin.name}, Email: ${admin.email}, Role: ${admin.role}, Verified: ${admin.isVerified}`);
        });

        if (admins.length === 0) {
            console.log('WARNING: No admin users found!');
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAdmin();
