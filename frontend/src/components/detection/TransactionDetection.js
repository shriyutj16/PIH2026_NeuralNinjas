import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import RiskResult from './RiskResult';

const TransactionDetection = () => {
  const { API } = useAuth();
  const [form, setForm] = useState({
    amount: '',
    frequency: '1',
    timeOfDay: 'afternoon',
    merchantCategory: 'retail',
    currency: 'USD',
    isInternational: false,
    location: 'domestic'
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) {
      return setError('Please enter a valid transaction amount');
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await API.post('/transactions/analyze', form);
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setForm({ amount: '', frequency: '1', timeOfDay: 'afternoon', merchantCategory: 'retail', currency: 'USD', isInternational: false, location: 'domestic' });
  };

  const presets = [
    { label: '✅ Low Risk', data: { amount: 25, frequency: 1, timeOfDay: 'afternoon', merchantCategory: 'food', isInternational: false } },
    { label: '⚠️ Medium Risk', data: { amount: 800, frequency: 4, timeOfDay: 'evening', merchantCategory: 'online', isInternational: true } },
    { label: '🚨 High Risk', data: { amount: 9500, frequency: 12, timeOfDay: 'night', merchantCategory: 'crypto', isInternational: true } },
  ];

  const loadPreset = (preset) => {
    setForm(prev => ({ ...prev, ...preset.data }));
    setResult(null);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💳 Transaction Risk Analysis</h1>
        <p className="page-subtitle">Simulate a transaction to assess fraud risk using rule-based AI scoring</p>
      </div>

      {!result ? (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">💰 Transaction Details</h3>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Quick Test Presets:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {presets.map((preset, i) => (
                  <button key={i} className="btn btn-outline btn-sm" onClick={() => loadPreset(preset)}>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="alert-banner medium" style={{ marginBottom: 16 }}>
                <span className="alert-icon">⚠️</span>
                <div className="alert-content"><p>{error}</p></div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input type="number" className="form-input" placeholder="0.00"
                    value={form.amount} min="0.01" step="0.01"
                    onChange={e => setForm({ ...form, amount: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value })}>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Transactions in 24hrs</label>
                  <input type="number" className="form-input" placeholder="1"
                    value={form.frequency} min="1" max="100"
                    onChange={e => setForm({ ...form, frequency: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time of Day</label>
                  <select className="form-select" value={form.timeOfDay}
                    onChange={e => setForm({ ...form, timeOfDay: e.target.value })}>
                    <option value="morning">Morning (6AM-12PM)</option>
                    <option value="afternoon">Afternoon (12PM-5PM)</option>
                    <option value="evening">Evening (5PM-10PM)</option>
                    <option value="night">Night (10PM-6AM) ⚠️</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Merchant Category</label>
                <select className="form-select" value={form.merchantCategory}
                  onChange={e => setForm({ ...form, merchantCategory: e.target.value })}>
                  <option value="retail">🏪 Retail</option>
                  <option value="food">🍕 Food & Dining</option>
                  <option value="travel">✈️ Travel</option>
                  <option value="entertainment">🎭 Entertainment</option>
                  <option value="online">💻 Online Purchase</option>
                  <option value="crypto">₿ Cryptocurrency ⚠️</option>
                  <option value="wire_transfer">🏦 Wire Transfer ⚠️</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}>
                  <option value="domestic">Domestic</option>
                  <option value="international">International</option>
                  <option value="high_risk_country">High Risk Country ⚠️</option>
                  <option value="vpn">VPN / Proxy ⚠️</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={form.isInternational}
                    onChange={e => setForm({ ...form, isInternational: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  International Transaction
                </label>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <><span className="loading-spinner"></span> Calculating Risk...</> : '🔍 Analyze Transaction Risk'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">🧮 Risk Scoring Formula</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              Risk score combines 5 weighted factors:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { factor: 'Transaction Amount', weight: 25, icon: '💰', desc: 'Higher amounts = higher risk' },
                { factor: 'Frequency (Velocity)', weight: 20, icon: '⚡', desc: 'Many transactions in 24hrs' },
                { factor: 'Merchant Category', weight: 20, icon: '🏪', desc: 'Crypto/wire = highest risk' },
                { factor: 'Geographic Risk', weight: 20, icon: '🌍', desc: 'International/VPN = elevated' },
                { factor: 'Time of Day', weight: 15, icon: '🕐', desc: 'Night transactions = riskier' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--obsidian-2)', borderRadius: 8 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.factor}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <div style={{ background: 'rgba(0,212,255,0.1)', color: 'var(--electric)', padding: '2px 8px', borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                    {item.weight}%
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, padding: 12, background: 'var(--obsidian-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              <strong style={{ color: 'var(--electric)' }}>Formula:</strong><br />
              Score = Σ(factor × weight) / 100<br />
              + Amplifiers for combined risks<br />
              → Capped at 0-100%
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>AMOUNT</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>${parseFloat(form.amount).toLocaleString()} {form.currency}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>FREQUENCY</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{form.frequency}x / 24hrs</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CATEGORY</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{form.merchantCategory}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TIME</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{form.timeOfDay}</div>
              </div>
            </div>
          </div>
          <RiskResult result={result} onReset={handleReset} />
        </div>
      )}
    </div>
  );
};

export default TransactionDetection;