const auth = require('./auth');

// Admin-only middleware
const adminAuth = async (req, res, next) => {
    try {
        // First run the standard auth middleware
        await new Promise((resolve, reject) => {
            auth(req, res, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Authorization failed' });
    }
};

module.exports = adminAuth;
