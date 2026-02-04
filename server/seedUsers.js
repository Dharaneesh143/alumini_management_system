require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alumni_portal');
        console.log('MongoDB Connected');

        // Clear existing users (optional - comment out if you want to keep existing users)
        // Clear existing users to ensure fresh test data
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Hash password for all test users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // Test users for all three roles
        const testUsers = [
            {
                name: 'Admin User',
                email: 'admin@alumni.com',
                password: hashedPassword,
                role: 'admin',
                isVerified: true,
                profile: {
                    department: 'Administration',
                    batch: '2020',
                    company: 'Alumni Portal',
                    designation: 'System Administrator',
                    skills: ['Management', 'Administration'],
                    linkedin: 'https://linkedin.com/in/admin',
                    github: 'https://github.com/admin'
                }
            },
            {
                name: 'Alumni User',
                email: 'alumni@alumni.com',
                password: hashedPassword,
                role: 'alumni',
                isVerified: true,
                profile: {
                    department: 'Computer Science',
                    batch: '2018',
                    company: 'Tech Corp',
                    designation: 'Senior Software Engineer',
                    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
                    linkedin: 'https://linkedin.com/in/alumni',
                    github: 'https://github.com/alumni'
                }
            },
            {
                name: 'Student User',
                email: 'student@alumni.com',
                password: hashedPassword,
                role: 'student',
                isVerified: true,
                profile: {
                    department: 'Computer Science',
                    batch: '2024',
                    company: '',
                    designation: '',
                    skills: ['Python', 'Java', 'C++'],
                    linkedin: 'https://linkedin.com/in/student',
                    github: 'https://github.com/student'
                }
            }
        ];

        // Insert test users
        for (const userData of testUsers) {
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                console.log(`User ${userData.email} already exists, skipping...`);
            } else {
                const user = new User(userData);
                await user.save();
                console.log(`Created user: ${userData.email} (${userData.role})`);
            }
        }

        console.log('\n=== Test Users Created Successfully ===');
        console.log('\nLogin Credentials:');
        console.log('-----------------------------------');
        console.log('1. ADMIN:');
        console.log('   Email: admin@alumni.com');
        console.log('   Password: password123');
        console.log('\n2. ALUMNI:');
        console.log('   Email: alumni@alumni.com');
        console.log('   Password: password123');
        console.log('\n3. STUDENT:');
        console.log('   Email: student@alumni.com');
        console.log('   Password: password123');
        console.log('-----------------------------------\n');

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
};

seedUsers();
