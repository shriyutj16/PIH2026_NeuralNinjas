/**
 * FraudReport Model
 * Stores all fraud detection results (text, image, transaction)
 */

const mongoose = require('mongoose');

const FraudReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Type of scan performed
  type: {
    type: String,
    enum: ['text', 'image', 'transaction'],
    required: true
  },
  // Input data (what was analyzed)
  inputData: {
    text: String,           // For text scans
    imagePath: String,      // For image scans
    imageOriginalName: String,
    transactionDetails: {   // For transaction scans
      amount: Number,
      frequency: Number,
      timeOfDay: String,
      merchantCategory: String,
      location: String
    }
  },
  // Analysis Results
  result: {
    label: {
      type: String,
      enum: ['SCAM', 'NOT_SCAM', 'LOW_RISK', 'MEDIUM_RISK', 'HIGH_RISK'],
      required: true
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    // Detected patterns/reasons
    patterns: [{
      type: String
    }],
    explanation: String
  },
  // Metadata
  ipAddress: String,
  userAgent: String,
  isReviewed: {
    type: Boolean,
    default: false
  },
  adminNotes: String
}, {
  timestamps: true
});

// Index for faster queries
FraudReportSchema.index({ user: 1, createdAt: -1 });
FraudReportSchema.index({ 'result.riskLevel': 1 });
FraudReportSchema.index({ type: 1 });

module.exports = mongoose.model('FraudReport', FraudReportSchema);
