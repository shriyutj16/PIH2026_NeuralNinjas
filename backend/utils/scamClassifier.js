/**
 * Enhanced Scam Classifier
 * Uses Google Gemini API as primary engine + local pattern matching as fallback
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ==================== LOCAL FALLBACK PATTERNS ====================
const SCAM_PATTERNS = {
  urgency: {
    weight: 12,
    patterns: ['urgent', 'immediately', 'act now', 'limited time', 'expire', 'expires today', 'last chance', 'final notice', 'deadline', 'respond immediately', 'time sensitive', 'hurry', 'don\'t delay', 'act fast', 'right away', 'asap', 'within 24 hours', 'within 48 hours', 'today only', 'don\'t wait', 'before it\'s too late', 'expiring soon', 'closing soon', 'ending today', 'must act', 'do not ignore', 'failure to respond', 'immediate response required', 'reply immediately', 'contact us immediately', 'call immediately', 'respond now', 'click now', 'verify now', 'confirm now', 'update now', 'validate now']
  },
  financial: {
    weight: 18,
    patterns: ['free money', 'cash prize', 'unclaimed funds', 'lottery winner', 'inheritance', 'million dollars', 'bitcoin investment', 'double your money', 'guaranteed returns', 'wire transfer', 'western union', 'money order', 'prepaid card', 'gift card', 'send money', 'advance fee', 'processing fee', 'unlock funds', 'transfer fee', 'you have won', 'you\'ve won', 'prize money', 'jackpot', 'cash reward', 'financial assistance', 'loan approved', 'credit approved', 'investment opportunity', 'profit guaranteed', 'earn money', 'make money', 'easy cash', 'quick cash', 'money transfer', 'bank transfer', 'itunes card', 'google play card', 'amazon gift card', 'steam card', 'crypto payment', 'bitcoin payment', 'send bitcoin', 'pay in crypto', 'send ethereum', 'pay via paypal', 'venmo payment', 'zelle payment', 'cashapp', 'western union transfer', '100% profit', 'risk free investment', 'guaranteed profit', 'no risk', 'get rich', 'financial freedom', 'passive income', 'residual income']
  },
  identity: {
    weight: 18,
    patterns: ['verify your account', 'confirm identity', 'update payment', 'suspended account', 'click here to verify', 'enter your ssn', 'social security', 'bank details', 'credit card number', 'pin number', 'password reset', 'login credentials', 'verify now', 'account suspended', 'unusual activity', 'security alert', 'confirm your details', 'validate your account', 'account locked', 'account compromised', 'suspicious login', 'unauthorized access', 'your account will be closed', 'account termination', 'verify identity', 'confirm your identity', 'update your information', 'update billing', 'payment information required', 'enter your password', 'provide your details', 'submit your information', 'personal information required', 'ssn required', 'date of birth required', 'mother\'s maiden name', 'security questions', 'otp verification', 'one time password', 'verification code', 'enter the code', 'confirm the code']
  },
  prizes: {
    weight: 16,
    patterns: ['congratulations you won', 'you have been selected', 'lucky winner', 'claim your prize', 'reward points', 'exclusive offer', 'you are chosen', 'random selection', 'sweepstakes winner', 'you are a winner', 'selected as winner', 'prize winner', 'grand prize', 'you won', 'won a prize', 'won an iphone', 'won a gift', 'won cash', 'claim reward', 'collect your prize', 'redeem your prize', 'free iphone', 'free samsung', 'free gift', 'free reward', 'free vacation', 'free cruise', 'free laptop', 'free car', 'winner announcement', 'lucky draw', 'raffle winner', 'contest winner', 'you have been chosen', 'specially selected']
  },
  threats: {
    weight: 20,
    patterns: ['arrest warrant', 'irs audit', 'tax fraud', 'legal action', 'sue you', 'police will', 'deportation', 'account will be closed', 'virus detected', 'hacked', 'compromised', 'immediate action required', 'penalty', 'criminal charges', 'federal crime', 'lawsuit', 'court order', 'warrant issued', 'arrest', 'jail', 'prison', 'fbi', 'cia', 'interpol', 'government notice', 'official notice', 'legal notice', 'final warning', 'last warning', 'you will be arrested', 'criminal investigation', 'under investigation', 'face charges', 'face penalty', 'face fine', 'immigration', 'deportation notice', 'visa cancelled', 'passport blocked', 'social security suspended', 'ssn suspended', 'benefits suspended', 'your computer has a virus', 'malware detected', 'ransomware', 'your files are encrypted', 'pay to unlock', 'pay ransom']
  },
  phishing: {
    weight: 20,
    patterns: ['click the link', 'click here', 'follow this link', 'open this link', 'visit this website', 'go to this url', 'http://', 'bit.ly', 'tinyurl', 't.co', 'ow.ly', 'goo.gl', 'cutt.ly', 'rebrand.ly', 'shorturl', 'login to your account', 'sign in here', 'access your account here', 'your account needs attention', 'action required on your account', 'we noticed unusual', 'we detected unusual', 'suspicious activity detected', 'your paypal', 'your amazon', 'your netflix', 'your apple id', 'your google account', 'your microsoft account', 'your bank account', 'dear customer', 'dear user', 'dear account holder', 'dear valued customer', 'your account has been', 'we have noticed', 'we have detected', 'kindly click', 'kindly verify', 'kindly update', 'kindly confirm', 'please verify', 'please confirm', 'please update', 'please click']
  },
  tooGood: {
    weight: 14,
    patterns: ['work from home', 'easy money', 'make money fast', 'earn daily', 'guaranteed income', 'earn from home', 'online job', 'data entry job', 'typing job', 'copy paste job', 'earn per hour', 'earn per day', 'no experience needed', 'no qualification required', 'anyone can do', 'unlimited earning', 'unlimited income', 'earn in dollars', 'part time job', 'full time income', 'be your own boss', 'financial independence', 'retire early', 'quit your job', '500 per day', '1000 per day', '5000 per week', 'earn thousands', 'make thousands', 'six figure income', 'seven figure income', 'secret method', 'secret system', 'secret formula', 'insider secret', 'nobody tells you', 'banks don\'t want you to know', 'they don\'t want you', 'banned video', 'hidden secret', 'miracle method']
  }
};

const LEGITIMATE_PATTERNS = ['customer support', 'help center', 'privacy policy', 'terms of service', 'unsubscribe', 'opt out', 'order confirmation', 'shipping update', 'tracking number', 'your receipt', 'invoice attached', 'meeting scheduled', 'calendar invite', 'zoom link', 'teams meeting', 'your appointment', 'prescription ready', 'your doctor', 'test results', 'lab results', 'your subscription', 'renewal notice', 'your bill', 'statement available'];

// ==================== LOCAL FALLBACK ====================
function localClassify(text) {
  const normalizedText = text.toLowerCase().trim();
  const detectedPatterns = [];
  let patternScore = 0;

  Object.entries(SCAM_PATTERNS).forEach(([category, { weight, patterns }]) => {
    patterns.forEach(pattern => {
      if (normalizedText.includes(pattern)) {
        patternScore += weight;
        detectedPatterns.push(`${category}: "${pattern}"`);
      }
    });
  });

  patternScore = Math.min(patternScore, 70);

  let legitimateScore = 0;
  LEGITIMATE_PATTERNS.forEach(pattern => {
    if (normalizedText.includes(pattern)) legitimateScore += 8;
  });

  let linguisticScore = 0;
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
  if (capsRatio > 0.3 && text.length > 20) { linguisticScore += 15; detectedPatterns.push('linguistic: excessive capitalization'); }
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations >= 2) { linguisticScore += exclamations * 4; detectedPatterns.push(`linguistic: ${exclamations} exclamation marks`); }
  if (/bit\.ly|tinyurl|t\.co|ow\.ly|goo\.gl|cutt\.ly/i.test(text)) { linguisticScore += 25; detectedPatterns.push('phishing: URL shortener detected'); }
  if (/http:\/\//i.test(text)) { linguisticScore += 15; detectedPatterns.push('phishing: insecure HTTP link'); }
  if (/call.*now|call.*immediately|call.*urgent/i.test(text)) { linguisticScore += 15; detectedPatterns.push('urgency: urgent call to action'); }
  if (/^dear\s(customer|user|account|valued|sir|madam|friend)/i.test(normalizedText)) { linguisticScore += 15; detectedPatterns.push('phishing: generic "Dear" greeting'); }
  if (/kindly\s(click|verify|update|confirm|send|provide)/i.test(text)) { linguisticScore += 12; detectedPatterns.push('linguistic: "kindly" phrasing (scam indicator)'); }
  if (/you\s(have\s)?(won|win|are\sa\swinner|been\sselected|been\schosen)/i.test(text)) { linguisticScore += 20; detectedPatterns.push('prize: winner announcement language'); }
  linguisticScore = Math.min(linguisticScore, 50);

  let finalScore = Math.round((patternScore * 0.65) + (linguisticScore * 0.35) - (legitimateScore * 0.5));
  finalScore = Math.min(Math.max(finalScore, 0), 100);

  const categoriesHit = new Set(detectedPatterns.map(p => p.split(':')[0])).size;
  if (categoriesHit >= 3) finalScore = Math.min(finalScore + 10, 100);
  if (categoriesHit >= 5) finalScore = Math.min(finalScore + 10, 100);

  const label = finalScore >= 35 ? 'SCAM' : 'NOT_SCAM';
  const riskLevel = finalScore >= 65 ? 'High' : finalScore >= 35 ? 'Medium' : 'Low';

  return {
    label,
    riskScore: finalScore,
    riskLevel,
    confidence: Math.min(55 + Math.abs(finalScore - 50), 97),
    patterns: detectedPatterns.slice(0, 8),
    explanation: finalScore >= 65
      ? `🚨 HIGH RISK SCAM — Strong indicators across ${categoriesHit} categories.`
      : finalScore >= 35
        ? `⚠️ SUSPICIOUS — Scam patterns detected across ${categoriesHit} categories.`
        : 'No significant scam indicators detected. Text appears legitimate.',
    breakdown: { patternScore: Math.round(patternScore), linguisticScore: Math.round(linguisticScore), legitimateDeduction: Math.round(legitimateScore * 0.5) },
    engine: 'local'
  };
}

// ==================== GEMINI CLASSIFIER ====================
async function geminiClassify(text) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an expert scam and fraud detection AI. Analyze the following message and determine if it is a scam or fraud attempt.

Message to analyze:
"""
${text}
"""

Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "label": "SCAM" or "NOT_SCAM",
  "riskScore": <number 0-100>,
  "riskLevel": "High" or "Medium" or "Low",
  "confidence": <number 50-99>,
  "patterns": [<list of up to 8 short detected scam pattern strings>],
  "explanation": "<clear explanation of why this is or isn't a scam in 2-3 sentences>",
  "recommendation": "<what the user should do>",
  "breakdown": {
    "urgencyScore": <0-25>,
    "financialScore": <0-25>,
    "phishingScore": <0-25>,
    "threatScore": <0-25>
  }
}

Risk scoring guide:
- 0-34: Low risk (legitimate message)
- 35-64: Medium risk (suspicious, verify before engaging)
- 65-100: High risk (clear scam, do not engage)

Be strict and accurate. Common scam types: lottery/prize scams, phishing, IRS/government threats, romance scams, investment fraud, work-from-home fraud, tech support scams.`;

  const result = await model.generateContent(prompt);
  const response = result.response.text().trim();

  // Clean and parse JSON
  const cleaned = response.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    ...parsed,
    engine: 'gemini'
  };
}

// ==================== MAIN CLASSIFIER ====================
class ScamClassifier {
  async classify(text) {
    if (!text || typeof text !== 'string') {
      return { label: 'NOT_SCAM', riskScore: 0, riskLevel: 'Low', patterns: [], explanation: 'No text provided', engine: 'local' };
    }

    // Try Gemini first
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log('🤖 Using Gemini AI for analysis...');
        const result = await geminiClassify(text);
        console.log(`✅ Gemini result: ${result.label} (${result.riskScore}%)`);
        return result;
      } catch (err) {
        console.warn('⚠️ Gemini failed, falling back to local classifier:', err.message);
      }
    }

    // Fallback to local classifier
    console.log('🔧 Using local classifier...');
    return localClassify(text);
  }
}

module.exports = new ScamClassifier();