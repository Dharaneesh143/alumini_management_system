const express = require('express');
const router = express.Router();
const { getCollegeInfo, updateCollegeInfo } = require('../controllers/collegeInfoController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/', getCollegeInfo);
router.post('/', [auth, adminAuth], updateCollegeInfo);

module.exports = router;
