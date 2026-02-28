/**
 * Admin Panel Component
 * Platform-wide management for admins
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminPanel = () => {
  const { API } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, reportsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users?limit=20'),
        API.get('/admin/reports?limit=20')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.data);
      setReports(reportsRes.data.data);
    } catch (err) {
      console.error('Admin error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u));
    } catch (err) {
      console.error('Toggle error:', err);
    }
  };

  const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  const dailyData = stats?.dailyActivity?.map(d => ({
    date: d._id.slice(5),
    reports: d.reports,
    highRisk: d.highRisk
  })) || [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Panel</h1>
        <p className="page-subtitle">Platform management and analytics</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-secondary)', padding: 6, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' }}>
        {['overview', 'users', 'reports'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? 'var(--primary)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize', fontFamily: 'inherit'
            }}
          >
            {tab === 'overview' ? '📊' : tab === 'users' ? '👥' : '📋'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid-4" style={{ marginBottom: 24 }}>
            {[
              { icon: '👥', label: 'Total Users', value: stats?.totalUsers || 0, color: 'blue' },
              { icon: '🔍', label: 'Total Reports', value: stats?.totalReports || 0, color: 'blue' },
              { icon: '🚨', label: 'High Risk', value: stats?.highRiskReports || 0, color: 'red' },
              { icon: '🆕', label: 'New Users (30d)', value: stats?.newUsers || 0, color: 'green' },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
                <div>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            {/* Daily Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📈 Daily Activity (7 Days)</h3>
              </div>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={dailyData} barCategoryGap="30%">
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="reports" fill="#6366f1" radius={[4,4,0,0]} name="Total Scans" />
                    <Bar dataKey="highRisk" fill="#ef4444" radius={[4,4,0,0]} name="High Risk" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">No data yet</div></div>
              )}
            </div>

            {/* Reports by type */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">📋 Reports by Type</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(stats?.reportsByType || []).map((item, i) => {
                  const total = stats.totalReports || 1;
                  const pct = Math.round(item.count / total * 100);
                  const icons = { text: '💬', image: '🖼️', transaction: '💳' };
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{icons[item._id]} {item._id}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.count} ({pct}%)</span>
                      </div>
                      <div className="risk-progress-container" style={{ height: 6 }}>
                        <div className="risk-progress-bar low" style={{ width: `${pct}%`, background: 'var(--primary)' }}></div>
                      </div>
                    </div>
                  );
                })}
                {!stats?.reportsByType?.length && (
                  <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No reports yet</div></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">👥 User Management</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{users.length} users</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Scans</th>
                  <th>Scams Found</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.totalScans || 0}</td>
                    <td style={{ color: user.scamsDetected > 0 ? 'var(--danger)' : 'inherit' }}>
                      {user.scamsDetected || 0}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`risk-badge ${user.isActive ? 'safe' : 'scam'}`}>
                        {user.isActive ? '✅ Active' : '❌ Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-outline'}`}
                        onClick={() => toggleUser(user._id)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7}><div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-title">No users yet</div></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 All Fraud Reports</h3>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{reports.length} recent reports</span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Label</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id}>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{report.user?.name || 'Unknown'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{report.user?.email}</div>
                      </div>
                    </td>
                    <td>{{ text: '💬 Text', image: '🖼️ Image', transaction: '💳 Transaction' }[report.type]}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: RISK_COLORS[report.result.riskLevel] }}>
                        {report.result.riskScore}%
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${report.result.riskLevel.toLowerCase()}`}>
                        {report.result.riskLevel}
                      </span>
                    </td>
                    <td>
                      <span className={`risk-badge ${report.result.label === 'SCAM' || report.result.label === 'HIGH_RISK' ? 'scam' : 'safe'}`}>
                        {report.result.label?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No reports yet</div></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
