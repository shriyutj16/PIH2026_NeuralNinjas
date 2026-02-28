/**
 * RiskResult Component
 * Displays fraud detection results with risk meter and alert banner
 */

import React from 'react';

const RiskResult = ({ result, onReset }) => {
  if (!result) return null;

  const { riskScore, riskLevel, label, confidence, patterns, explanation, breakdown, recommendation } = result;
  
  const isHighRisk = riskLevel === 'High';
  const isMediumRisk = riskLevel === 'Medium';
  const levelClass = riskLevel?.toLowerCase() || 'low';

  return (
    <div>
      {/* Alert Banner - shown for Medium+ risk */}
      {isHighRisk && (
        <div className="alert-banner high">
          <span className="alert-icon">🚨</span>
          <div className="alert-content">
            <h4>HIGH RISK DETECTED — Do Not Engage!</h4>
            <p>This content shows strong indicators of fraud or scam activity. Do not click links, share personal information, or respond.</p>
          </div>
        </div>
      )}
      {isMediumRisk && (
        <div className="alert-banner medium">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <h4>Suspicious Activity Detected</h4>
            <p>This content has some scam indicators. Proceed with caution and verify before engaging.</p>
          </div>
        </div>
      )}
      {!isHighRisk && !isMediumRisk && (
        <div className="alert-banner info">
          <span className="alert-icon">✅</span>
          <div className="alert-content">
            <h4>Content Appears Safe</h4>
            <p>No significant scam patterns detected. Always stay vigilant.</p>
          </div>
        </div>
      )}

      {/* Risk Score Meter */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="risk-meter">
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Fraud Risk Score
          </div>
          <div className={`risk-meter-value ${levelClass}`}>
            {riskScore}<span style={{ fontSize: 28 }}>%</span>
          </div>
          <div className="risk-progress-container">
            <div
              className={`risk-progress-bar ${levelClass}`}
              style={{ width: `${riskScore}%` }}
            ></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            <span>0 — Safe</span>
            <span>50 — Suspicious</span>
            <span>100 — High Risk</span>
          </div>
          
          {/* Labels row */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className={`risk-badge ${levelClass}`}>
              {riskLevel === 'High' ? '🚨' : riskLevel === 'Medium' ? '⚠️' : '✅'} {riskLevel} Risk
            </span>
            <span className={`risk-badge ${label === 'SCAM' ? 'scam' : 'safe'}`}>
              {label?.replace('_', ' ')}
            </span>
            {confidence && (
              <span className="risk-badge" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--primary-light)' }}>
                {confidence}% Confidence
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>🧠 AI Analysis</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{explanation}</p>
          {recommendation && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', borderLeft: `3px solid ${isHighRisk ? 'var(--danger)' : isMediumRisk ? 'var(--warning)' : 'var(--success)'}` }}>
              💡 {recommendation}
            </div>
          )}
        </div>
      )}

      {/* Detected Patterns */}
      {patterns && patterns.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 12 }}>🎯 Detected Patterns ({patterns.length})</div>
          <div>
            {patterns.map((pattern, i) => (
              <span key={i} className="pattern-tag">⚑ {pattern}</span>
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      {breakdown && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>📊 Score Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(breakdown).map(([key, value]) => {
              const labels = {
                patternScore: 'Pattern Detection',
                linguisticScore: 'Linguistic Analysis',
                tfidfScore: 'ML Similarity',
                legitimateDeduction: 'Legitimate Signals',
                amountRisk: 'Amount Risk',
                frequencyRisk: 'Frequency Risk',
                timeRisk: 'Time-of-Day Risk',
                categoryRisk: 'Merchant Category',
                geoRisk: 'Geographic Risk'
              };
              const isDeduction = key === 'legitimateDeduction';
              const displayVal = isDeduction ? -value : value;
              const maxVal = key.includes('amount') || key.includes('frequency') ? 25 : 
                            key.includes('time') ? 15 : 
                            key.includes('category') || key.includes('geo') ? 20 : 100;
              
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>{labels[key] || key}</span>
                    <span style={{ color: isDeduction ? 'var(--success)' : 'var(--text-primary)', fontWeight: 600 }}>
                      {isDeduction ? '-' : '+'}{Math.abs(value)} pts
                    </span>
                  </div>
                  <div className="risk-progress-container" style={{ height: 5 }}>
                    <div
                      style={{
                        height: '100%', borderRadius: 4,
                        width: `${Math.min(Math.abs(value) / maxVal * 100, 100)}%`,
                        background: isDeduction ? 'var(--success)' : 
                          value > 15 ? 'var(--risk-high)' : 
                          value > 7 ? 'var(--risk-medium)' : 'var(--primary)',
                        transition: 'width 1s ease'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset button */}
      {onReset && (
        <button className="btn btn-outline" onClick={onReset}>
          🔄 Analyze Another
        </button>
      )}
    </div>
  );
};

export default RiskResult;
