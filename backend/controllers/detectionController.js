/**
 * Detection Controller
 * Handles text SMS scam detection and image upload analysis
 * Uses Gemini AI as primary engine with local fallback
 */

const FraudReport = require('../models/FraudReport');
const User = require('../models/User');
const scamClassifier = require('../utils/scamClassifier');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// @desc    Analyze text for scams (SMS, email, etc.)
// @route   POST /api/detection/text
// @access  Private
exports.analyzeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Text content is required' });
    }

    if (text.length > 5000) {
      return res.status(400).json({ success: false, message: 'Text too long (max 5000 chars)' });
    }

    // Run Gemini AI classification (with local fallback)
    const classification = await scamClassifier.classify(text);

    // Save fraud report to DB
    const report = await FraudReport.create({
      user: req.user.id,
      type: 'text',
      inputData: { text },
      result: {
        label: classification.label,
        riskScore: classification.riskScore,
        riskLevel: classification.riskLevel,
        confidence: classification.confidence,
        patterns: classification.patterns,
        explanation: classification.explanation
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        totalScans: 1,
        scamsDetected: classification.label === 'SCAM' ? 1 : 0
      }
    });

    res.status(201).json({
      success: true,
      reportId: report._id,
      engine: classification.engine || 'local',
      result: {
        label: classification.label,
        riskScore: classification.riskScore,
        riskLevel: classification.riskLevel,
        confidence: classification.confidence,
        patterns: classification.patterns,
        explanation: classification.explanation,
        recommendation: classification.recommendation,
        breakdown: classification.breakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload and analyze screenshot using OCR + Gemini AI
// @route   POST /api/detection/image
// @access  Private
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    const imagePath = req.file.filename;
    const originalName = req.file.originalname;
    const fullImagePath = path.join(__dirname, '../uploads', imagePath);

    console.log(`🔍 Running OCR on: ${originalName}`);

    // ==================== REAL OCR ====================
    let extractedText = '';
    let ocrConfidence = 0;

    try {
      const ocrResult = await Tesseract.recognize(fullImagePath, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\r📖 OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      extractedText = ocrResult.data.text || '';
      ocrConfidence = Math.round(ocrResult.data.confidence || 0);
      console.log(`\n✅ OCR Complete — Confidence: ${ocrConfidence}%`);
      console.log(`📝 Extracted Text (${extractedText.length} chars): ${extractedText.slice(0, 200)}...`);
    } catch (ocrError) {
      console.error('OCR Error:', ocrError.message);
      extractedText = '';
    }

    // ==================== AI ANALYSIS ====================
    let classification;
    let analysisNote = '';

    if (extractedText && extractedText.trim().length > 10) {
      // Analyze OCR-extracted text with Gemini AI
      classification = await scamClassifier.classify(extractedText);
      analysisNote = `OCR extracted ${extractedText.length} characters with ${ocrConfidence}% confidence.`;

      // Slight boost if OCR confidence is low (blurry images can be suspicious)
      if (ocrConfidence < 50 && ocrConfidence > 0) {
        classification.riskScore = Math.min(classification.riskScore + 5, 100);
        analysisNote += ' Low OCR confidence — image may be blurred or altered.';
      }
    } else {
      // Fallback: assign moderate score if no text found
      console.log('⚠️ OCR could not extract text, using fallback analysis');
      const fallbackText = `image file ${originalName}`;
      classification = await scamClassifier.classify(fallbackText);
      classification.riskScore = Math.max(classification.riskScore, 20);
      classification.riskLevel = classification.riskScore >= 65 ? 'High' : classification.riskScore >= 35 ? 'Medium' : 'Low';
      classification.label = classification.riskScore >= 35 ? 'SCAM' : 'NOT_SCAM';
      analysisNote = 'Could not extract text from image (low quality or non-text image).';
    }

    // Extra boost for suspicious filenames
    const suspiciousFilenames = ['scam', 'phish', 'fake', 'spam', 'fraud', 'prize', 'win', 'lottery', 'hack'];
    if (suspiciousFilenames.some(w => originalName.toLowerCase().includes(w))) {
      classification.riskScore = Math.min(classification.riskScore + 10, 100);
      classification.patterns = [...(classification.patterns || []), 'filename: suspicious filename detected'];
    }

    // Recalculate risk level after boosts
    classification.riskLevel = classification.riskScore >= 65 ? 'High'
      : classification.riskScore >= 35 ? 'Medium' : 'Low';
    classification.label = classification.riskScore >= 35 ? 'SCAM' : 'NOT_SCAM';

    // Save report
    const report = await FraudReport.create({
      user: req.user.id,
      type: 'image',
      inputData: {
        imagePath,
        imageOriginalName: originalName
      },
      result: {
        label: classification.label,
        riskScore: classification.riskScore,
        riskLevel: classification.riskLevel,
        confidence: classification.confidence || 75,
        patterns: classification.patterns,
        explanation: `${analysisNote} ${classification.explanation}`
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        totalScans: 1,
        scamsDetected: classification.label === 'SCAM' ? 1 : 0
      }
    });

    res.status(201).json({
      success: true,
      reportId: report._id,
      imageUrl: `/uploads/${imagePath}`,
      extractedText: extractedText.slice(0, 500),
      ocrConfidence,
      engine: classification.engine || 'local',
      result: {
        label: classification.label,
        riskScore: classification.riskScore,
        riskLevel: classification.riskLevel,
        confidence: classification.confidence || 75,
        patterns: classification.patterns,
        explanation: `${analysisNote} ${classification.explanation}`,
        recommendation: classification.recommendation,
        breakdown: classification.breakdown
      }
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};