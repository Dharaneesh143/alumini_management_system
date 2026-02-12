const CollegeInfo = require('../models/CollegeInfo');

// @route   GET api/college-info
// @desc    Get college details
exports.getCollegeInfo = async (req, res) => {
    try {
        const info = await CollegeInfo.findOne();
        res.json(info || {});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST api/college-info
// @desc    Create or update college details (Admin only)
exports.updateCollegeInfo = async (req, res) => {
    try {
        let info = await CollegeInfo.findOne();
        if (info) {
            info = await CollegeInfo.findByIdAndUpdate(
                info._id,
                { $set: req.body },
                { new: true }
            );
        } else {
            info = new CollegeInfo(req.body);
            await info.save();
        }
        res.json(info);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
