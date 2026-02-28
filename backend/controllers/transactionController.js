/**
 * Transaction Controller
 * Risk scoring for financial transactions
 */

const Transaction = require('../models/Transaction');
const FraudReport = require('../models/FraudReport');
const User = require('../models/User');
const { calculateTransactionRisk } = require('../utils/transactionRiskScorer');

// @desc    Analyze a transaction for fraud risk
// @route   POST /api/transactions/analyze
// @access  Private
exports.analyzeTransaction = async (req, res) => {
  try {
    const { amount, frequency, timeOfDay, merchantCategory, location, isInternational, currency } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Valid transaction amount is required' });
    }

    // Run risk scoring engine
    const riskAssessment = calculateTransactionRisk({
      amount: parseFloat(amount),
      frequency: parseInt(frequency) || 1,
      timeOfDay: timeOfDay || 'afternoon',
      merchantCategory: merchantCategory || 'other',
      location: location || 'domestic',
      isInternational: Boolean(isInternational)
    });

    // Create fraud report
    const fraudReport = await FraudReport.create({
      user: req.user.id,
      type: 'transaction',
      inputData: {
        transactionDetails: {
          amount: parseFloat(amount),
          frequency: parseInt(frequency) || 1,
          timeOfDay,
          merchantCategory,
          location
        }
      },
      result: {
        label: riskAssessment.label,
        riskScore: riskAssessment.riskScore,
        riskLevel: riskAssessment.riskLevel,
        patterns: riskAssessment.riskFactors,
        explanation: riskAssessment.recommendation
      },
      ipAddress: req.ip
    });

    // Save transaction record
    const transaction = await Transaction.create({
      user: req.user.id,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      timeOfDay,
      frequency: parseInt(frequency) || 1,
      merchantCategory: merchantCategory || 'other',
      location: location || 'domestic',
      isInternational: Boolean(isInternational),
      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      riskFactors: riskAssessment.riskFactors,
      fraudReport: fraudReport._id,
      status: riskAssessment.riskLevel === 'High' ? 'flagged' : 'pending'
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: {
        totalScans: 1,
        scamsDetected: riskAssessment.riskLevel === 'High' ? 1 : 0
      }
    });

    res.status(201).json({
      success: true,
      transactionId: transaction._id,
      reportId: fraudReport._id,
      result: {
        ...riskAssessment,
        transactionStatus: transaction.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user transaction history
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
