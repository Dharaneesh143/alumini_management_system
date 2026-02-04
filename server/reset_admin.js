const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

dotenv.config();

const resetAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin user found to reset.');
            process.exit(1);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        admin.password = hashedPassword;
        await admin.save();

        console.log(`Password for admin (${admin.email}) has been reset to: admin123`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

resetAdmin();
