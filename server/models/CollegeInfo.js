const mongoose = require('mongoose');

const collegeInfoSchema = new mongoose.Schema({
    college_name: {
        type: String,
        required: true
    },
    address: String,
    contact_email: String,
    contact_number: String,
    website: String,
    placement_officer_name: String
}, { timestamps: true });

module.exports = mongoose.model('CollegeInfo', collegeInfoSchema);
