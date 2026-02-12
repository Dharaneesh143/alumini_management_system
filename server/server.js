require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Global Logging Function
const logToFile = (msg) => {
    const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
    try {
        fs.appendFileSync(path.join(__dirname, 'debug.log'), logMsg);
    } catch (e) { }
    console.log(msg);
};

// Create uploads directory if it doesn't exist
const folders = [
    'uploads/resumes',
    'uploads/logos',
    'uploads/jobs/jd',
    'uploads/chat/images',
    'uploads/chat/docs',
    'uploads/chat/voice'
];

folders.forEach(folder => {
    const dir = path.join(__dirname, folder);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 1. CORS Configuration (Keep it early)
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://aluminimanagementsystem.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Log every origin check for debugging
        logToFile(`[CORS Request] Origin: ${origin}`);

        // Reflect origin back for localhost development
        if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(null, true); // ALLOW ALL for now to break the loop
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Accept']
};
app.use(cors(corsOptions));

// 2. Body Parsers (MUST come before logging to parse req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Logging Middleware
app.use((req, res, next) => {
    logToFile(`📡 ${req.method} ${req.url} (Origin: ${req.get('origin') || 'no-origin'})`);
    if (req.method === 'POST') {
        logToFile(`📦 Body: ${JSON.stringify(req.body)}`);
    }
    next();
});


// 4. Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 5000;

// Database Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI || !process.env.JWT_SECRET) {
    logToFile('❌ CRITICAL ERROR: Environment variables missing');
    process.exit(1);
}

mongoose.connect(mongoURI, {
    ssl: true,
    tlsAllowInvalidCertificates: true
})
    .then(async () => {
        logToFile('✅ MongoDB Connected Successfully');
        // Admin seeding...
        try {
            const User = require('./models/User');
            const bcrypt = require('bcrypt');
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount === 0) {
                console.log('🚀 No admin found in User collection. Seeding default admin...');
                const hashedPassword = await bcrypt.hash('Admin@123', 10);
                const defaultAdmin = new User({
                    name: 'System Admin',
                    email: 'admin@admin.com',
                    password: hashedPassword,
                    role: 'admin',
                    approvalStatus: 'approved',
                    status: 'Active'
                });
                await defaultAdmin.save();
                console.log('✅ Default admin created in User collection: admin@admin.com / Admin@123');
            }
        } catch (err) {
            logToFile(`❌ Seeding failed: ${err.message}`);
        }
    })
    .catch(err => {
        logToFile(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/mentorship', require('./routes/mentorship'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/college-info', require('./routes/collegeInfoRoutes'));

app.get('/', (req, res) => res.send('Alumni Portal API is Running'));

// Global Error Handler
app.use((err, req, res, next) => {
    logToFile(`💥 GLOBAL ERROR: ${err.message}\n${err.stack}`);
    res.status(500).json({ msg: 'Server Error', error: err.message });
});

process.on('unhandledRejection', (reason, promise) => {
    logToFile(`🔥 Unhandled Rejection at: ${promise} reason: ${reason}`);
});

process.on('uncaughtException', (err) => {
    logToFile(`🔥 Uncaught Exception: ${err.stack || err}`);
});

// Start Server
app.listen(PORT, () => {
    logToFile(`🚀 Server is ACTIVELY running on port ${PORT} (CORS FIX V2)`);
});
