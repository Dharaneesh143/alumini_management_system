const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const findAlumni = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const alumni = await User.findOne({ role: 'alumni' });
        if (alumni) {
            console.log('Found Alumni:', alumni.email);
        } else {
            console.log('No alumni found');
        }
        mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

findAlumni();
