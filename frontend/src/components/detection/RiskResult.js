import React from 'react';

const RiskResult = ({ result, onReset }) => {
  if (!result) return null;
  const { riskScore, riskLevel, label, confidence, patterns, explanation, breakdown, recommendation } = result;
  const isHigh = riskLevel === 'High';
  const isMedium = riskLevel === 'Medium';
  const levelClass = riskLevel?.toLowerCase() || 'low';

  return (
    <div style={{ animation: 'fadeInUp 0.4s ease' }}>
      {isHigh && (
        <div className="alert-banner high">
          <span className="alert-icon">🚨</span>
          <div className="alert-content">
            <h4>HIGH RISK DETECTED — Do Not Engage</h4>
            <p>Strong fraud indicators found. Do not click links, share personal info, or send money.</p>
          </div>
        </div>
      )}
      {isMedium && (
        <div className="alert-banner medium">
          <span className="alert-icon">⚠️</span>
          <div className="alert-content">
            <h4>Suspicious Activity Detected</h4>
            <p>Scam indicators present. Verify the source before engaging.</p>
          </div>
        </div>
      )}
      {!isHigh && !isMedium && (
        <div className="alert-banner info">
          <span className="alert-icon">✅</span>
          <div className="alert-content">
            <h4>Content Appears Safe</h4>
            <p>No significant scam patterns detected. Always stay vigilant.</p>
          </div>
        </div>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="risk-meter">
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 2 }}>Fraud Risk Score</div>
          <div className={`risk-meter-value ${levelClass}`}>
            {riskScore}<span style={{ fontSize: 32, opacity: 0.6 }}>%</span>
          </div>
          <div className="risk-progress-container">
            <div className={`risk-progress-bar ${levelClass}`} style={{ width: `${riskScore}%` }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)', marginBottom: 14 }}>
            <span>0 — Safe</span><span>50 — Suspicious</span><span>100 — Danger</span>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className={`risk-badge ${levelClass}`}>
              {isHigh ? '🚨' : isMedium ? '⚠️' : '✅'} {riskLevel} Risk
            </span>
            <span className={`risk-badge ${label === 'SCAM' ? 'scam' : 'safe'}`}>
              {label?.replace('_', ' ')}
            </span>
            {confidence && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: 'rgba(0,212,255,0.08)', color: 'var(--electric)', border: '1px solid rgba(0,212,255,0.2)' }}>
                {confidence}% Confidence
              </span>
            )}
          </div>
        </div>
      </div>

      {explanation && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>🧠 AI Analysis</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{explanation}</p>
          {recommendation && (
            <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--obsidian-2)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-secondary)', borderLeft: `3px solid ${isHigh ? 'var(--risk-high)' : isMedium ? 'var(--risk-medium)' : 'var(--risk-low)'}` }}>
              💡 {recommendation}
            </div>
          )}
        </div>
      )}

      {patterns && patterns.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 14 }}>
            🎯 Detected Patterns <span style={{ fontSize: 12, color: 'var(--crimson)', fontWeight: 400 }}>({patterns.length})</span>
          </div>
          <div>{patterns.map((p, i) => <span key={i} className="pattern-tag">⚑ {p}</span>)}</div>
        </div>
      )}

      {breakdown && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 18 }}>📊 Score Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(breakdown).map(([key, value]) => {
              const labels = { patternScore: 'Pattern Detection', linguisticScore: 'Linguistic Analysis', tfidfScore: 'ML Similarity', legitimateDeduction: 'Legitimate Signals', amountRisk: 'Amount Risk', frequencyRisk: 'Frequency Risk', timeRisk: 'Time-of-Day Risk', categoryRisk: 'Merchant Category', geoRisk: 'Geographic Risk' };
              const isDeduction = key === 'legitimateDeduction';
              const maxVal = key.includes('amount') || key.includes('frequency') ? 25 : key.includes('time') ? 15 : key.includes('category') || key.includes('geo') ? 20 : 100;
              const pct = Math.min(Math.abs(value) / maxVal * 100, 100);
              const barColor = isDeduction ? 'var(--risk-low)' : value > 15 ? 'var(--risk-high)' : value > 7 ? 'var(--risk-medium)' : 'var(--electric)';
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{labels[key] || key}</span>
                    <span style={{ color: barColor, fontWeight: 700 }}>{isDeduction ? '-' : '+'}{Math.abs(value)} pts</span>
                  </div>
                  <div className="risk-progress-container" style={{ height: 4 }}>
                    <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: barColor, transition: 'width 1s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {onReset && (
        <button className="btn btn-outline" onClick={onReset} style={{ marginTop: 4 }}>
          🔄 Analyze Another
        </button>
      )}
    </div>
  );
};

export default RiskResult;