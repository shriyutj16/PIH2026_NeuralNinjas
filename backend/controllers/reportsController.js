/**
 * Reports Controller
 * Fraud report history and analytics
 */

const FraudReport = require('../models/FraudReport');

// @desc    Get user's fraud report history
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type, riskLevel } = req.query;

    // Build filter
    const filter = { user: req.user.id };
    if (type) filter.type = type;
    if (riskLevel) filter['result.riskLevel'] = riskLevel;

    const reports = await FraudReport.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FraudReport.countDocuments(filter);

    // Summary stats
    const stats = await FraudReport.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$result.riskLevel',
          count: { $sum: 1 },
          avgScore: { $avg: '$result.riskScore' }
        }
      }
    ]);

    res.json({
      success: true,
      data: reports,
      stats,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res) => {
  try {
    const report = await FraudReport.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total counts by risk level
    const riskBreakdown = await FraudReport.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$result.riskLevel', count: { $sum: 1 } } }
    ]);

    // Counts by type
    const typeBreakdown = await FraudReport.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Recent 7 days trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trend = await FraudReport.aggregate([
      { $match: { user: userId, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          avgRisk: { $avg: '$result.riskScore' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalReports = await FraudReport.countDocuments({ user: userId });
    const highRiskCount = await FraudReport.countDocuments({ user: userId, 'result.riskLevel': 'High' });

    res.json({
      success: true,
      stats: {
        totalReports,
        highRiskCount,
        riskBreakdown,
        typeBreakdown,
        trend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
