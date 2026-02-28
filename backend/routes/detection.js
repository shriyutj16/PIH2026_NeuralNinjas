const express = require('express');
const router = express.Router();
const { analyzeText, analyzeImage } = require('../controllers/detectionController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/text', protect, analyzeText);
router.post('/image', protect, upload.single('screenshot'), analyzeImage);

module.exports = router;
