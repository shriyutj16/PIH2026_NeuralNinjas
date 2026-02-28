/**
 * Dashboard - Main overview page
 * Shows stats, recent activity, and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

const Dashboard = () => {
  const { user, API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        API.get('/reports/stats'),
        API.get('/reports?limit=5')
      ]);
      setStats(statsRes.data.stats);
      setRecentReports(reportsRes.data.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';

  // Build pie chart data from risk breakdown
  const pieData = stats?.riskBreakdown?.map(item => ({
    name: item._id,
    value: item.count,
    color: RISK_COLORS[item._id] || '#6366f1'
  })) || [];

  // Build trend chart data
  const trendData = stats?.trend?.map(item => ({
    date: item._id.slice(5), // MM-DD
    reports: item.count,
    avgRisk: Math.round(item.avgRisk)
  })) || [];

  const formatType = (type) => ({ text: 'SMS/Text', image: 'Screenshot', transaction: 'Transaction' }[type] || type);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  const totalReports = stats?.totalReports || 0;
  const highRisk = stats?.riskBreakdown?.find(r => r._id === 'High')?.count || 0;
  const mediumRisk = stats?.riskBreakdown?.find(r => r._id === 'Medium')?.count || 0;
  const safeScans = stats?.riskBreakdown?.find(r => r._id === 'Low')?.count || 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name} — Here's your fraud protection overview</p>
      </div>

      {/* High risk alert banner */}
      {highRisk > 0 && (
        <div className="alert-banner high">
          <span className="alert-icon">🚨</span>
          <div className="alert-content">
            <h4>High Risk Activity Detected</h4>
            <p>{highRisk} high-risk threat{highRisk > 1 ? 's' : ''} found in your recent scans. Review your fraud history immediately.</p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon blue">🔍</div>
          <div>
            <div className="stat-value">{totalReports}</div>
            <div className="stat-label">Total Scans</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">🚨</div>
          <div>
            <div className="stat-value" style={{ color: highRisk > 0 ? 'var(--risk-high)' : 'inherit' }}>{highRisk}</div>
            <div className="stat-label">High Risk Found</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">⚠️</div>
          <div>
            <div className="stat-value" style={{ color: mediumRisk > 0 ? 'var(--risk-medium)' : 'inherit' }}>{mediumRisk}</div>
            <div className="stat-label">Medium Risk</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--risk-low)' }}>{safeScans}</div>
            <div className="stat-label">Safe / Low Risk</div>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Trend Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 7-Day Scan Activity</h3>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="reports" stroke="#6366f1" fill="url(#riskGradient)" strokeWidth={2} name="Scans" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No activity yet</div>
              <div className="empty-state-desc">Start scanning to see your trend</div>
            </div>
          )}
        </div>

        {/* Risk Breakdown Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎯 Risk Breakdown</h3>
          </div>
          {pieData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {pieData.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }}></div>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 600, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🎯</div>
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
            { icon: '💬', label: 'Scan SMS/Text', desc: 'Paste suspicious messages', path: '/detect/text', color: '#6366f1' },
            { icon: '🖼️', label: 'Upload Screenshot', desc: 'Analyze scam screenshots', path: '/detect/image', color: '#0ea5e9' },
            { icon: '💳', label: 'Check Transaction', desc: 'Simulate transaction risk', path: '/detect/transaction', color: '#22c55e' },
          ].map(action => (
            <div key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                background: 'var(--bg-primary)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '18px', cursor: 'pointer',
                transition: 'all 0.2s', textAlign: 'center'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = action.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{action.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{action.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🕐 Recent Scans</h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/history')}>View All</button>
        </div>
        {recentReports.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Risk Level</th>
                  <th>Score</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map(report => (
                  <tr key={report._id}>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {report.type === 'text' ? '💬' : report.type === 'image' ? '🖼️' : '💳'}
                        {formatType(report.type)}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${report.result.riskLevel.toLowerCase()}`}>
                        {report.result.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: RISK_COLORS[report.result.riskLevel], fontWeight: 600 }}>
                        {report.result.riskScore}%
                      </span>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`risk-badge ${report.result.label === 'SCAM' || report.result.label === 'HIGH_RISK' ? 'scam' : 'safe'}`}>
                        {report.result.label === 'SCAM' || report.result.label === 'HIGH_RISK' ? '⚠️ Threat' : '✅ Safe'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No scans yet</div>
            <div className="empty-state-desc">Use the Quick Actions above to start protecting yourself</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
