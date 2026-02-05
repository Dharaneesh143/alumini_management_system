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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    logToFile(`📡 ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        logToFile(`📦 Body: ${JSON.stringify(req.body)}`);
    }
    next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://aluminimanagementsystem.vercel.app',
    process.env.FRONTEND_URL // Useful for production
].filter(Boolean);

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};
app.use(cors(corsOptions));

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
            const Admin = require('./models/Admin');
            const bcrypt = require('bcrypt');
            const adminCount = await Admin.countDocuments();
            if (adminCount === 0) {
                console.log('🚀 No admin found. Seeding default admin...');
                const hashedPassword = await bcrypt.hash('Dharaneesh@1', 10);
                const defaultAdmin = new Admin({
                    name: 'System Admin',
                    email: 'dharaneesh@admin.com',
                    password: hashedPassword,
                    role: 'admin'
                });
                await defaultAdmin.save();
                console.log('✅ Default admin created: dharaneesh@admin.com / Dharaneesh@1');
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
app.use('/api/mentorship', require('./routes/mentorship'));

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
    logToFile(`Server running on port ${PORT}`);
});
