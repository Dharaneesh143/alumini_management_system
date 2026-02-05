require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Admin = require('./models/Admin');

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/alumni_portal');
        console.log('MongoDB Connected');

        await Admin.deleteMany({});
        await User.deleteMany({});
        console.log('Cleared existing admins and users');

        const salt = await bcrypt.genSalt(10);
        const password123 = await bcrypt.hash('password123', salt);

        // Seed Admin
        const admin = new Admin({
            name: 'Admin User',
            email: 'admin@alumni.com',
            password: password123,
            role: 'admin'
        });
        await admin.save();
        console.log('Created admin: admin@alumni.com');

        // Seed Users
        const testUsers = [
            {
                name: 'Alumni User',
                email: 'alumni@alumni.com',
                password: password123,
                role: 'alumni',
                approvalStatus: 'approved',
                phoneNumber: '1234567890',
                department: 'Computer Science', // NEW top level
                batch: '2018',         // NEW top level
                passedOutYear: '2018',
                currentCompany: 'Tech Corp',
                jobRole: 'Senior Software Engineer',
                isMentor: true,
                mentorSettings: {
                    capacity: 5,
                    mentorshipAreas: ['React', 'Node.js', 'System Design'],
                    resumeReview: true
                },
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
                password: password123,
                role: 'student',
                approvalStatus: 'approved',
                registerNumber: 'STUD001',
                department: 'Computer Science', // NEW top level
                batch: '2024',         // NEW top level
                phoneNumber: '9876543210',  // NEW top level
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

        for (const userData of testUsers) {
            const user = new User(userData);
            await user.save();
            console.log(`Created user: ${userData.email} (${userData.role})`);
        }

        console.log('\n=== Test Accounts Created Successfully ===');
        console.log('\nLogin Credentials:');
        console.log('-----------------------------------');
        console.log('1. ADMIN collection: admin@alumni.com / password123');
        console.log('2. USER collection : alumni@alumni.com / password123');
        console.log('3. USER collection : student@alumni.com / password123');
        console.log('-----------------------------------\n');

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
};

seedUsers();
