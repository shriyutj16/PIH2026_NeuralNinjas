const express = require('express');
const router = express.Router();
const { getSystemStats, getAllUsers, getAllReports, toggleUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get('/stats', getSystemStats);
router.get('/users', getAllUsers);
router.get('/reports', getAllReports);
router.put('/users/:id/toggle', toggleUserStatus);

module.exports = router;
