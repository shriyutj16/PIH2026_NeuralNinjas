const express = require('express');
const router = express.Router();
const { getReports, getReport, getDashboardStats } = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getDashboardStats);
router.get('/', protect, getReports);
router.get('/:id', protect, getReport);

module.exports = router;
