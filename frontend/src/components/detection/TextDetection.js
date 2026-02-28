/**
 * Text Detection Component
 * Analyze SMS/email text for scam patterns
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RiskResult from './RiskResult';

const SAMPLE_SCAMS = [
  "URGENT: Your bank account has been SUSPENDED! Verify immediately at http://bit.ly/bank-verify or lose access!",
  "Congratulations! You've won $50,000 in our lottery! Claim your prize NOW - call +1-800-PRIZE or send processing fee of $200 via gift card.",
  "IRS NOTICE: Outstanding tax fraud charge. You will be ARRESTED if payment not made immediately. Call 1-855-IRS-HELP now!",
  "You have been selected for a FREE iPhone 15! Claim within 24 hours. Enter your SSN and credit card to verify identity.",
  "Your PayPal account shows unusual activity. Verify your account now: http://paypal-secure.verify-login.com"
];

const TextDetection = () => {
  const { API } = useAuth();
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const { data } = await API.post('/detection/text', { text });
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setText('');
    setCharCount(0);
  };

  const loadSample = (sample) => {
    setText(sample);
    setCharCount(sample.length);
    setResult(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💬 SMS / Text Scam Detection</h1>
        <p className="page-subtitle">Paste any suspicious message to analyze it for scam patterns using AI</p>
      </div>

      {!result ? (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Input Form */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📝 Enter Text</h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{charCount}/5000</span>
            </div>

            {error && (
              <div className="alert-banner medium" style={{ marginBottom: 16 }}>
                <span className="alert-icon">⚠️</span>
                <div className="alert-content"><p>{error}</p></div>
              </div>
            )}

            <form onSubmit={handleAnalyze}>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  placeholder="Paste the suspicious SMS, email, or message here...&#10;&#10;Example: 'URGENT: Your account has been compromised...'"
                  value={text}
                  onChange={e => { setText(e.target.value); setCharCount(e.target.value.length); }}
                  style={{ minHeight: 180 }}
                  maxLength={5000}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading || !text.trim()}
              >
                {loading ? <><span className="loading-spinner"></span> Analyzing with AI...</> : '🔍 Analyze for Scams'}
              </button>
            </form>

            <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                🤖 AI ANALYSIS INCLUDES:
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'grid', gap: 4 }}>
                <span>✓ 100+ scam pattern detection</span>
                <span>✓ TF-IDF ML similarity scoring</span>
                <span>✓ Linguistic anomaly detection</span>
                <span>✓ URL & phone pressure analysis</span>
              </div>
            </div>
          </div>

          {/* Sample Messages */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📋 Sample Scam Messages</h3>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to test</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SAMPLE_SCAMS.map((sample, i) => (
                <div
                  key={i}
                  onClick={() => loadSample(sample)}
                  style={{
                    padding: '10px 12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, cursor: 'pointer',
                    fontSize: 12, color: 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--danger)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ color: 'var(--danger)', marginRight: 6 }}>⚠️</span>
                  {sample.slice(0, 100)}...
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Show the analyzed text */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>ANALYZED TEXT:</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', background: 'var(--bg-primary)', padding: 12, borderRadius: 8 }}>
              "{text.slice(0, 200)}{text.length > 200 ? '...' : ''}"
            </p>
          </div>
          <RiskResult result={result} onReset={handleReset} />
        </div>
      )}
    </div>
  );
};

export default TextDetection;
