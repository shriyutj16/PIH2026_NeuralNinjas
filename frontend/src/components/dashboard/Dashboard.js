import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const RISK_COLORS = { High: '#ff2d55', Medium: '#ffab00', Low: '#00e676' };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#1a1a28', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: '#9090b0', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || '#00d4ff', fontWeight: 600 }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        API.get('/reports/stats'),
        API.get('/reports?limit=5')
      ]);
      setStats(statsRes.data.stats);
      setRecentReports(reportsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pieData = stats?.riskBreakdown?.map(i => ({ name: i._id, value: i.count, color: RISK_COLORS[i._id] || '#7c3aed' })) || [];
  const trendData = stats?.trend?.map(i => ({ date: i._id.slice(5), reports: i.count, avgRisk: Math.round(i.avgRisk) })) || [];
  const totalReports = stats?.totalReports || 0;
  const highRisk = stats?.riskBreakdown?.find(r => r._id === 'High')?.count || 0;
  const mediumRisk = stats?.riskBreakdown?.find(r => r._id === 'Medium')?.count || 0;
  const safeScans = stats?.riskBreakdown?.find(r => r._id === 'Low')?.count || 0;
  const formatType = t => ({ text: 'SMS/Text', image: 'Screenshot', transaction: 'Transaction' }[t] || t);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }}></div>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">📊 Dashboard</h1>
            <p className="page-subtitle">Welcome back, <span style={{ color: 'var(--electric)' }}>{user?.name}</span> — Your fraud protection overview</p>
          </div>
          <div style={{ padding: '8px 14px', background: 'var(--obsidian-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--risk-low)', display: 'inline-block', boxShadow: '0 0 8px var(--risk-low)' }}></span>
            SYSTEM ACTIVE
          </div>
        </div>
      </div>

      {highRisk > 0 && (
        <div className="alert-banner high">
          <span className="alert-icon">🚨</span>
          <div className="alert-content">
            <h4>High Risk Activity Detected</h4>
            <p>{highRisk} high-risk threat{highRisk > 1 ? 's' : ''} found. Review your fraud history immediately.</p>
          </div>
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { icon: '🔍', label: 'Total Scans', value: totalReports, color: 'blue', accent: 'var(--electric)' },
          { icon: '🚨', label: 'High Risk', value: highRisk, color: 'red', accent: 'var(--risk-high)' },
          { icon: '⚠️', label: 'Medium Risk', value: mediumRisk, color: 'yellow', accent: 'var(--risk-medium)' },
          { icon: '✅', label: 'Safe Scans', value: safeScans, color: 'green', accent: 'var(--risk-low)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ color: i > 0 ? s.accent : undefined }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 7-Day Activity</h3>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 1 }}>Last 7 days</span>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#303050" tick={{ fontSize: 11, fill: '#505070' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#303050" tick={{ fontSize: 11, fill: '#505070' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="reports" stroke="#00d4ff" fill="url(#areaGrad)" strokeWidth={2} name="Scans" dot={{ fill: '#00d4ff', r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">📊</span>
              <div className="empty-state-title">No activity yet</div>
              <div className="empty-state-desc">Start scanning to see your trend</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Risk Breakdown</h3>
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={4} strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} opacity={0.9} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, flexShrink: 0 }}></div>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{item.name}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: item.color, fontFamily: 'var(--font-display)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-state-icon">🎯</span>
              <div className="empty-state-title">No data yet</div>
              <div className="empty-state-desc">Complete scans to see breakdown</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <h3 className="card-title">⚡ Quick Actions</h3>
        </div>
        <div className="grid-3">
          {[
            { icon: '💬', label: 'Scan SMS / Text', desc: 'Paste suspicious messages', path: '/detect/text', color: '#00d4ff' },
            { icon: '🖼️', label: 'Upload Screenshot', desc: 'Analyze with real OCR', path: '/detect/image', color: '#ff2d55' },
            { icon: '💳', label: 'Transaction Risk', desc: 'Score transaction risk', path: '/detect/transaction', color: '#00e676' },
          ].map((a, i) => (
            <div key={a.path} onClick={() => navigate(a.path)}
              style={{ background: 'var(--obsidian-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px 18px', cursor: 'pointer', transition: 'all 0.25s', textAlign: 'center', animation: 'fadeInUp 0.4s ease both', animationDelay: `${i * 0.05 + 0.2}s` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 32px ${a.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 5 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🕐 Recent Scans</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/history')}>View All →</button>
        </div>
        {recentReports.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Type</th><th>Risk Level</th><th>Score</th><th>Date</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentReports.map(r => (
                  <tr key={r._id}>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>{r.type === 'text' ? '💬' : r.type === 'image' ? '🖼️' : '💳'}<span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatType(r.type)}</span></span></td>
                    <td><span className={`risk-badge ${r.result.riskLevel.toLowerCase()}`}>{r.result.riskLevel}</span></td>
                    <td><span style={{ color: RISK_COLORS[r.result.riskLevel], fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 15 }}>{r.result.riskScore}%</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><span className={`risk-badge ${r.result.label === 'SCAM' || r.result.label === 'HIGH_RISK' ? 'scam' : 'safe'}`}>{r.result.label === 'SCAM' || r.result.label === 'HIGH_RISK' ? '⚠️ Threat' : '✅ Safe'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">🔍</span>
            <div className="empty-state-title">No scans yet</div>
            <div className="empty-state-desc">Use Quick Actions above to get started</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;