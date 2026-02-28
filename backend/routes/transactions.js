const express = require('express');
const router = express.Router();
const { analyzeTransaction, getTransactions } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

router.post('/analyze', protect, analyzeTransaction);
router.get('/', protect, getTransactions);

module.exports = router;
