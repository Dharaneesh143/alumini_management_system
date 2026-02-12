require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

const createTestData = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) throw new Error('MONGO_URI is missing');

        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected');

        // Create Alumni
        const email = 'alumni_test@example.com';
        let alumni = await User.findOne({ email });

        if (!alumni) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            alumni = new User({
                name: 'Test Alumni',
                email: email,
                password: hashedPassword,
                role: 'alumni',
                approvalStatus: 'approved', // Verified
                department: 'CS',
                batch: '2020',
                phoneNumber: '1234567890'
            });
            await alumni.save();
            console.log('Test Alumni Created: ' + email);
        } else {
            console.log('Test Alumni already exists');
            // Ensure valid/approved
            alumni.approvalStatus = 'approved';
            await alumni.save();
        }

        // Create/Update Admin
        const Admin = require('./models/Admin');
        const adminEmail = 'admin@admin.com';
        let admin = await User.findOne({ email: adminEmail, role: 'admin' }); // Check User collection first

        // Note: The logic in server.js implies Admin might be in a separate collection OR User collection.
        // server.js uses require('./models/Admin') but the login uses User.findOne({ role: 'admin' }) in some places?
        // Let's check authController.js again. 
        // authController.adminLogin uses User.findOne({ email, role: 'admin' }).
        // BUT server.js seeds into Admin model?
        // This indicates a potential discrepancy in the project structure (Admin model vs User model with role='admin').

        // Let's check Admin model definition.

        // For now, I will create a User with role 'admin' to match authController.adminLogin logic.

        if (!admin) {
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            admin = new User({
                name: 'System Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                accountStatus: 'active'
            });
            await admin.save();
            console.log('Admin User Created: ' + adminEmail);
        } else {
            console.log('Admin User exists, updating password...');
            const hashedPassword = await bcrypt.hash('Admin@123', 10);
            admin.password = hashedPassword;
            await admin.save();
            console.log('Admin Password Updated');
        }

        process.exit(0);

    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

createTestData();
