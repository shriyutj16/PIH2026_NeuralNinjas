/**
 * Transaction Model
 * Stores transaction data for risk analysis
 */

const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required'],
    min: [0.01, 'Amount must be positive']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  // Transaction timing
  transactionTime: {
    type: Date,
    default: Date.now
  },
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'],
  },
  // Frequency: transactions in last 24 hours
  frequency: {
    type: Number,
    default: 1,
    min: 1
  },
  merchantCategory: {
    type: String,
    enum: ['retail', 'food', 'travel', 'entertainment', 'online', 'crypto', 'wire_transfer', 'other'],
    default: 'other'
  },
  location: {
    type: String,
    default: 'domestic'
  },
  isInternational: {
    type: Boolean,
    default: false
  },
  // Risk Assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  riskFactors: [String],
  // Link to fraud report
  fraudReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FraudReport'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'flagged', 'blocked'],
    default: 'pending'
  }
}, {
  timestamps: true
});

TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ riskLevel: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
