/**
 * Transaction Risk Scorer
 * Rule-based risk assessment engine for financial transactions
 * Implements multiple risk factors with weighted scoring
 */

/**
 * Risk Score Formula:
 * Total Risk = Σ(factor_weight × factor_score) / total_possible_weight × 100
 * 
 * Factors:
 * 1. Amount anomaly (0-25 pts)
 * 2. Transaction frequency (0-20 pts)
 * 3. Time of day risk (0-15 pts)
 * 4. Merchant category risk (0-20 pts)
 * 5. Geographic risk (0-20 pts)
 */

// Risk weights for each factor
const RISK_WEIGHTS = {
  amount: 25,
  frequency: 20,
  timeOfDay: 15,
  merchantCategory: 20,
  geographic: 20
};

// Merchant category risk levels (higher = riskier)
const MERCHANT_RISK = {
  retail: 0.1,
  food: 0.1,
  entertainment: 0.2,
  travel: 0.3,
  online: 0.4,
  other: 0.4,
  crypto: 0.8,
  wire_transfer: 0.9
};

// Time-based risk (unusual hours are riskier)
const getTimeRisk = (hour) => {
  // 9AM-6PM = low risk, late night = high risk
  if (hour >= 9 && hour <= 18) return 0.1;
  if (hour >= 6 && hour < 9) return 0.3;
  if (hour > 18 && hour <= 22) return 0.3;
  return 0.8; // 11PM-6AM = high risk
};

/**
 * Calculate comprehensive transaction risk score
 * @param {Object} transaction - Transaction data
 * @returns {Object} - Risk assessment result
 */
const calculateTransactionRisk = (transaction) => {
  const { amount, frequency, timeOfDay, merchantCategory, location, isInternational } = transaction;
  
  const riskFactors = [];
  let totalScore = 0;

  // ---- Factor 1: Amount Risk (0-25 points) ----
  let amountRisk = 0;
  if (amount > 10000) {
    amountRisk = 1.0;
    riskFactors.push('Very large transaction amount (>$10,000)');
  } else if (amount > 5000) {
    amountRisk = 0.75;
    riskFactors.push('Large transaction amount (>$5,000)');
  } else if (amount > 1000) {
    amountRisk = 0.4;
    riskFactors.push('Elevated transaction amount (>$1,000)');
  } else if (amount > 500) {
    amountRisk = 0.2;
  } else {
    amountRisk = 0.05;
  }
  totalScore += amountRisk * RISK_WEIGHTS.amount;

  // ---- Factor 2: Frequency Risk (0-20 points) ----
  let frequencyRisk = 0;
  if (frequency > 10) {
    frequencyRisk = 1.0;
    riskFactors.push(`Very high transaction frequency (${frequency} in 24hrs)`);
  } else if (frequency > 5) {
    frequencyRisk = 0.7;
    riskFactors.push(`High transaction frequency (${frequency} in 24hrs)`);
  } else if (frequency > 3) {
    frequencyRisk = 0.4;
    riskFactors.push(`Elevated frequency (${frequency} transactions)`);
  } else {
    frequencyRisk = 0.1;
  }
  totalScore += frequencyRisk * RISK_WEIGHTS.frequency;

  // ---- Factor 3: Time of Day Risk (0-15 points) ----
  let timeRisk = 0;
  const hour = getHourFromTimeString(timeOfDay);
  timeRisk = getTimeRisk(hour);
  if (timeRisk > 0.5) {
    riskFactors.push(`Unusual transaction time (${timeOfDay || 'odd hours'})`);
  }
  totalScore += timeRisk * RISK_WEIGHTS.timeOfDay;

  // ---- Factor 4: Merchant Category Risk (0-20 points) ----
  const categoryRisk = MERCHANT_RISK[merchantCategory] || MERCHANT_RISK.other;
  if (categoryRisk >= 0.7) {
    riskFactors.push(`High-risk merchant category: ${merchantCategory}`);
  } else if (categoryRisk >= 0.4) {
    riskFactors.push(`Moderate-risk merchant category: ${merchantCategory}`);
  }
  totalScore += categoryRisk * RISK_WEIGHTS.merchantCategory;

  // ---- Factor 5: Geographic Risk (0-20 points) ----
  let geoRisk = 0;
  if (isInternational) {
    geoRisk = 0.7;
    riskFactors.push('International transaction');
  }
  if (location === 'high_risk_country') {
    geoRisk = 1.0;
    riskFactors.push('Transaction from high-risk geographic region');
  } else if (location === 'vpn' || location === 'proxy') {
    geoRisk = 0.85;
    riskFactors.push('Transaction via VPN/proxy detected');
  } else if (!isInternational) {
    geoRisk = 0.1;
  }
  totalScore += geoRisk * RISK_WEIGHTS.geographic;

  // ---- Combination Amplifiers ----
  // Multiple risk factors compound each other
  if (amountRisk > 0.5 && frequencyRisk > 0.5) {
    totalScore *= 1.15; // 15% amplification for amount + frequency combo
    riskFactors.push('Pattern: High amount + High frequency (velocity fraud risk)');
  }
  if (timeRisk > 0.5 && categoryRisk > 0.5) {
    totalScore *= 1.1;
    riskFactors.push('Pattern: Night-time high-risk merchant (suspicious)');
  }

  // ---- Normalize to 0-100 ----
  const maxPossible = Object.values(RISK_WEIGHTS).reduce((a, b) => a + b, 0);
  const riskScore = Math.min(Math.round((totalScore / maxPossible) * 100), 100);
  
  // ---- Determine risk level ----
  const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low';

  return {
    riskScore,
    riskLevel,
    riskFactors,
    breakdown: {
      amountRisk: Math.round(amountRisk * RISK_WEIGHTS.amount),
      frequencyRisk: Math.round(frequencyRisk * RISK_WEIGHTS.frequency),
      timeRisk: Math.round(timeRisk * RISK_WEIGHTS.timeOfDay),
      categoryRisk: Math.round(categoryRisk * RISK_WEIGHTS.merchantCategory),
      geoRisk: Math.round(geoRisk * RISK_WEIGHTS.geographic)
    },
    recommendation: getRecommendation(riskScore),
    label: riskScore >= 70 ? 'HIGH_RISK' : riskScore >= 40 ? 'MEDIUM_RISK' : 'LOW_RISK'
  };
};

// Parse time string to hour number
const getHourFromTimeString = (timeStr) => {
  if (!timeStr) return 12; // Default to noon
  const timeMap = { morning: 9, afternoon: 14, evening: 18, night: 23 };
  if (timeMap[timeStr]) return timeMap[timeStr];
  // Try parsing direct hour
  const hour = parseInt(timeStr);
  return isNaN(hour) ? 12 : hour;
};

const getRecommendation = (score) => {
  if (score >= 70) return 'Block transaction and notify user immediately. Requires manual review.';
  if (score >= 40) return 'Flag for review. Send verification SMS to account holder before processing.';
  return 'Transaction appears normal. Proceed with standard processing.';
};

module.exports = { calculateTransactionRisk };
