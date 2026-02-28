/**
 * Enhanced NLP Scam Classifier
 * Improved TF-IDF + aggressive pattern matching for better detection
 */

const natural = require('natural');

// ==================== EXPANDED SCAM PATTERNS ====================

const SCAM_PATTERNS = {
  urgency: {
    weight: 12,
    patterns: [
      'urgent', 'immediately', 'act now', 'limited time', 'expire', 'expires today',
      'last chance', 'final notice', 'deadline', 'respond immediately', 'time sensitive',
      'hurry', 'don\'t delay', 'act fast', 'right away', 'asap', 'within 24 hours',
      'within 48 hours', 'today only', 'don\'t wait', 'before it\'s too late',
      'expiring soon', 'closing soon', 'ending today', 'must act', 'do not ignore',
      'failure to respond', 'immediate response required', 'reply immediately',
      'contact us immediately', 'call immediately', 'respond now', 'click now',
      'verify now', 'confirm now', 'update now', 'validate now'
    ]
  },
  financial: {
    weight: 18,
    patterns: [
      'free money', 'cash prize', 'unclaimed funds', 'lottery winner', 'inheritance',
      'million dollars', 'bitcoin investment', 'double your money', 'guaranteed returns',
      'wire transfer', 'western union', 'money order', 'prepaid card', 'gift card',
      'send money', 'advance fee', 'processing fee', 'unlock funds', 'transfer fee',
      'you have won', 'you\'ve won', 'prize money', 'jackpot', 'cash reward',
      'financial assistance', 'loan approved', 'credit approved', 'investment opportunity',
      'profit guaranteed', 'earn money', 'make money', 'easy cash', 'quick cash',
      'money transfer', 'bank transfer', 'itunes card', 'google play card',
      'amazon gift card', 'steam card', 'crypto payment', 'bitcoin payment',
      'send bitcoin', 'pay in crypto', 'send ethereum', 'pay via paypal',
      'venmo payment', 'zelle payment', 'cashapp', 'western union transfer',
      '100% profit', 'risk free investment', 'guaranteed profit', 'no risk',
      'get rich', 'financial freedom', 'passive income', 'residual income'
    ]
  },
  identity: {
    weight: 18,
    patterns: [
      'verify your account', 'confirm identity', 'update payment', 'suspended account',
      'click here to verify', 'enter your ssn', 'social security', 'bank details',
      'credit card number', 'pin number', 'password reset', 'login credentials',
      'verify now', 'account suspended', 'unusual activity', 'security alert',
      'confirm your details', 'validate your account', 'account locked',
      'account compromised', 'suspicious login', 'unauthorized access',
      'your account will be closed', 'account termination', 'verify identity',
      'confirm your identity', 'update your information', 'update billing',
      'payment information required', 'enter your password', 'provide your details',
      'submit your information', 'personal information required', 'ssn required',
      'date of birth required', 'mother\'s maiden name', 'security questions',
      'otp verification', 'one time password', 'verification code',
      'enter the code', 'confirm the code'
    ]
  },
  prizes: {
    weight: 16,
    patterns: [
      'congratulations you won', 'you have been selected', 'lucky winner',
      'claim your prize', 'reward points', 'exclusive offer', 'you are chosen',
      'random selection', 'sweepstakes winner', 'you are a winner',
      'selected as winner', 'prize winner', 'grand prize', 'you won',
      'won a prize', 'won an iphone', 'won a gift', 'won cash',
      'claim reward', 'collect your prize', 'redeem your prize',
      'free iphone', 'free samsung', 'free gift', 'free reward',
      'free vacation', 'free cruise', 'free laptop', 'free car',
      'winner announcement', 'lucky draw', 'raffle winner',
      'contest winner', 'you have been chosen', 'specially selected'
    ]
  },
  threats: {
    weight: 20,
    patterns: [
      'arrest warrant', 'irs audit', 'tax fraud', 'legal action', 'sue you',
      'police will', 'deportation', 'account will be closed', 'virus detected',
      'hacked', 'compromised', 'immediate action required', 'penalty',
      'criminal charges', 'federal crime', 'lawsuit', 'court order',
      'warrant issued', 'arrest', 'jail', 'prison', 'fbi', 'cia', 'interpol',
      'government notice', 'official notice', 'legal notice', 'final warning',
      'last warning', 'you will be arrested', 'criminal investigation',
      'under investigation', 'face charges', 'face penalty', 'face fine',
      'immigration', 'deportation notice', 'visa cancelled', 'passport blocked',
      'social security suspended', 'ssn suspended', 'benefits suspended',
      'your computer has a virus', 'malware detected', 'ransomware',
      'your files are encrypted', 'pay to unlock', 'pay ransom'
    ]
  },
  phishing: {
    weight: 20,
    patterns: [
      'click the link', 'click here', 'follow this link', 'open this link',
      'visit this website', 'go to this url', 'http://', 'bit.ly', 'tinyurl',
      't.co', 'ow.ly', 'goo.gl', 'cutt.ly', 'rebrand.ly', 'shorturl',
      'login to your account', 'sign in here', 'access your account here',
      'your account needs attention', 'action required on your account',
      'we noticed unusual', 'we detected unusual', 'suspicious activity detected',
      'your paypal', 'your amazon', 'your netflix', 'your apple id',
      'your google account', 'your microsoft account', 'your bank account',
      'dear customer', 'dear user', 'dear account holder', 'dear valued customer',
      'your account has been', 'we have noticed', 'we have detected',
      'kindly click', 'kindly verify', 'kindly update', 'kindly confirm',
      'please verify', 'please confirm', 'please update', 'please click'
    ]
  },
  tooGood: {
    weight: 14,
    patterns: [
      'work from home', 'easy money', 'make money fast', 'earn daily',
      'guaranteed income', 'earn from home', 'online job', 'data entry job',
      'typing job', 'copy paste job', 'earn per hour', 'earn per day',
      'no experience needed', 'no qualification required', 'anyone can do',
      'unlimited earning', 'unlimited income', 'earn in dollars',
      'part time job', 'full time income', 'be your own boss',
      'financial independence', 'retire early', 'quit your job',
      '500 per day', '1000 per day', '5000 per week', 'earn thousands',
      'make thousands', 'six figure income', 'seven figure income',
      'secret method', 'secret system', 'secret formula', 'insider secret',
      'nobody tells you', 'banks don\'t want you to know', 'they don\'t want you',
      'banned video', 'hidden secret', 'miracle method'
    ]
  },
  romantic: {
    weight: 15,
    patterns: [
      'i am a beautiful woman', 'i am lonely', 'looking for serious relationship',
      'send me money', 'need money for flight', 'stuck in', 'stranded in',
      'medical emergency', 'need your help financially', 'western union',
      'money gram', 'i love you already', 'you are my soulmate',
      'met you on facebook', 'met you on instagram', 'military officer',
      'us army', 'deployed overseas', 'working offshore', 'oil rig',
      'send gift card', 'buy me gift card', 'itunes gift card for me'
    ]
  }
};

// Legitimate signals that reduce score
const LEGITIMATE_PATTERNS = [
  'customer support', 'help center', 'privacy policy', 'terms of service',
  'unsubscribe', 'opt out', 'order confirmation', 'shipping update',
  'tracking number', 'your receipt', 'invoice attached', 'meeting scheduled',
  'calendar invite', 'zoom link', 'teams meeting', 'your appointment',
  'prescription ready', 'your doctor', 'test results', 'lab results',
  'your subscription', 'renewal notice', 'your bill', 'statement available'
];

class ScamClassifier {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this._initializeTrainingData();
  }

  _initializeTrainingData() {
    // Scam training documents
    const scamDocs = [
      'congratulations you won lottery million dollars claim prize now urgent call immediately',
      'your account suspended verify immediately click link enter password credit card details',
      'free bitcoin investment double money guaranteed returns no risk earn daily passive income',
      'irs tax fraud arrest warrant immediate action required call now avoid penalty criminal charges',
      'unclaimed inheritance funds wire transfer advance fee processing unlock millions dollars',
      'limited time offer exclusive reward claim free iphone gift card hurry expires today',
      'unusual activity detected update payment information verify account now dear customer',
      'work from home earn 5000 daily no experience needed guaranteed income easy money secret',
      'social security number compromised act now avoid legal action police arrest warrant issued',
      'you have been selected lucky winner random draw claim reward collect prize today only',
      'dear user account will be closed verify identity click here login credentials required',
      'military officer stationed overseas need money transfer western union stranded emergency',
      'virus detected your computer hacked pay now remove malware ransomware files encrypted',
      'investment opportunity guaranteed profit 100 percent returns financial freedom retire',
      'nigerian prince inheritance millions transfer fee advance payment bank account details',
      'payday loan approved instantly bad credit okay send personal information ssn required',
      'amazon winner selected claim free gift card click link verify account dear valued customer',
      'bitcoin trading profit guaranteed double investment secret method nobody tells you',
      'final notice outstanding debt legal action lawsuit court order pay immediately avoid arrest',
      'sexy singles near you click here meet beautiful women lonely looking serious relationship'
    ];

    // Legitimate training documents
    const legitimateDocs = [
      'your order has been confirmed will ship within 3 business days tracking number provided',
      'thank you purchase receipt attached contact customer support if questions arise',
      'password changed successfully contact support if you did not make this change',
      'monthly newsletter latest updates from our team unsubscribe anytime privacy policy',
      'meeting scheduled tomorrow 3pm please confirm attendance calendar invite sent',
      'package delivered successfully please rate your delivery experience with us',
      'welcome getting started guide help center available for any questions you have',
      'system maintenance scheduled sunday 2am brief downtime expected no action required',
      'new feature announcement product update release notes version 2 now available',
      'invoice payment due 15th please review attached document contact billing department',
      'your prescription is ready for pickup at pharmacy call us if you have questions',
      'appointment reminder tomorrow 10am with doctor please bring insurance card',
      'your subscription renews next month cancel anytime in account settings page',
      'zoom meeting link attached for tomorrow discussion agenda included in invite',
      'your bank statement is now available login to view it in your secure online portal'
    ];

    scamDocs.forEach(doc => this.tfidf.addDocument(doc));
    legitimateDocs.forEach(doc => this.tfidf.addDocument(doc));
  }

  classify(text) {
    if (!text || typeof text !== 'string') {
      return { label: 'NOT_SCAM', riskScore: 0, riskLevel: 'Low', patterns: [], explanation: 'No text provided' };
    }

    const normalizedText = text.toLowerCase().trim();
    const detectedPatterns = [];
    let patternScore = 0;

    // ---- Step 1: Pattern matching with weights ----
    Object.entries(SCAM_PATTERNS).forEach(([category, { weight, patterns }]) => {
      patterns.forEach(pattern => {
        if (normalizedText.includes(pattern)) {
          patternScore += weight;
          detectedPatterns.push(`${category}: "${pattern}"`);
        }
      });
    });

    // Cap pattern score at 70
    patternScore = Math.min(patternScore, 70);

    // ---- Step 2: Legitimate signal deduction ----
    let legitimateScore = 0;
    LEGITIMATE_PATTERNS.forEach(pattern => {
      if (normalizedText.includes(pattern)) legitimateScore += 8;
    });

    // ---- Step 3: Linguistic analysis ----
    let linguisticScore = 0;

    // Excessive caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1);
    if (capsRatio > 0.3 && text.length > 20) {
      linguisticScore += 15;
      detectedPatterns.push('linguistic: excessive capitalization');
    }

    // Excessive exclamation marks
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations >= 2) {
      linguisticScore += exclamations * 4;
      detectedPatterns.push(`linguistic: ${exclamations} exclamation marks`);
    }

    // URL shorteners
    if (/bit\.ly|tinyurl|t\.co|ow\.ly|goo\.gl|cutt\.ly|rebrand\.ly/i.test(text)) {
      linguisticScore += 25;
      detectedPatterns.push('phishing: URL shortener detected');
    }

    // Suspicious URLs (http not https)
    if (/http:\/\//i.test(text)) {
      linguisticScore += 15;
      detectedPatterns.push('phishing: insecure HTTP link');
    }

    // Random numbers mixed in (common in spam)
    if (/\$[\d,]+|\d+\s*(dollars|usd|euro|pounds)/i.test(text)) {
      linguisticScore += 10;
      detectedPatterns.push('financial: monetary amount mentioned');
    }

    // Phone pressure
    if (/call.*now|call.*immediately|call.*urgent|call.*asap/i.test(text)) {
      linguisticScore += 15;
      detectedPatterns.push('urgency: urgent call to action');
    }

    // Greeting "Dear" (phishing hallmark)
    if (/^dear\s(customer|user|account|valued|sir|madam|friend)/i.test(normalizedText)) {
      linguisticScore += 15;
      detectedPatterns.push('phishing: generic "Dear" greeting');
    }

    // Grammar red flags (common in scam messages)
    if (/kindly\s(click|verify|update|confirm|send|provide)/i.test(text)) {
      linguisticScore += 12;
      detectedPatterns.push('linguistic: "kindly" phrasing (scam indicator)');
    }

    // Reward/prize language
    if (/you\s(have\s)?(won|win|are\sa\swinner|been\sselected|been\schosen)/i.test(text)) {
      linguisticScore += 20;
      detectedPatterns.push('prize: winner announcement language');
    }

    // Cap linguistic at 50
    linguisticScore = Math.min(linguisticScore, 50);

    // ---- Step 4: TF-IDF score ----
    let tfidfScore = 0;
    this.tfidf.tfidfs(normalizedText, (i, measure) => {
      if (i < 20) tfidfScore += measure * 2; // scam docs
      else tfidfScore -= measure * 1.5;       // legit docs
    });
    const normalizedTfidf = Math.min(Math.max(tfidfScore / 4, 0), 15);

    // ---- Step 5: Combine ----
    const rawScore = (patternScore * 0.55) + (linguisticScore * 0.30) + (normalizedTfidf * 0.15);
    let finalScore = Math.round(rawScore - (legitimateScore * 0.5));
    finalScore = Math.min(Math.max(finalScore, 0), 100);

    // ---- Step 6: Boost for multiple categories hit ----
    const categoriesHit = new Set(detectedPatterns.map(p => p.split(':')[0])).size;
    if (categoriesHit >= 3) {
      finalScore = Math.min(finalScore + 10, 100);
    }
    if (categoriesHit >= 5) {
      finalScore = Math.min(finalScore + 10, 100);
    }

    // ---- Step 7: Label ----
    const label = finalScore >= 35 ? 'SCAM' : 'NOT_SCAM';
    const riskLevel = finalScore >= 65 ? 'High' : finalScore >= 35 ? 'Medium' : 'Low';
    const confidence = Math.min(55 + Math.abs(finalScore - 50), 97);
    const explanation = this._generateExplanation(finalScore, detectedPatterns, categoriesHit);

    return {
      label,
      riskScore: finalScore,
      riskLevel,
      confidence,
      patterns: detectedPatterns.slice(0, 8),
      explanation,
      breakdown: {
        patternScore: Math.round(patternScore),
        linguisticScore: Math.round(linguisticScore),
        tfidfScore: Math.round(normalizedTfidf),
        legitimateDeduction: Math.round(legitimateScore * 0.5)
      }
    };
  }

  _generateExplanation(score, patterns, categoriesHit) {
    if (score < 20) return 'No significant scam indicators detected. Text appears legitimate.';
    if (score < 35) return `Low risk. Minor suspicious elements found in ${categoriesHit} categor${categoriesHit > 1 ? 'ies' : 'y'}. Stay cautious.`;
    if (score < 65) return `⚠️ SUSPICIOUS — Scam patterns detected across ${categoriesHit} categories: ${patterns.slice(0, 3).map(p => p.split(': ')[1]).join(', ')}. Do not click links or share info.`;
    return `🚨 HIGH RISK SCAM — Strong indicators across ${categoriesHit} categories. Patterns: ${patterns.slice(0, 4).map(p => p.split(': ')[1]).join(', ')}. Do NOT respond, click links, or send money.`;
  }
}

module.exports = new ScamClassifier();