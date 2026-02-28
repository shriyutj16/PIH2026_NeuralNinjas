/**
 * Fraud History Component
 * Paginated list of all past fraud analysis reports
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const RISK_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
const TYPE_ICONS = { text: '💬', image: '🖼️', transaction: '💳' };
const TYPE_LABELS = { text: 'SMS/Text', image: 'Screenshot', transaction: 'Transaction' };

const FraudHistory = () => {
  const { API } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ type: '', riskLevel: '', page: 1 });
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.riskLevel) params.set('riskLevel', filters.riskLevel);
      params.set('page', filters.page);
      params.set('limit', 10);

      const { data } = await API.get(`/reports?${params}`);
      setReports(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, maxLen = 60) => 
    text && text.length > maxLen ? text.slice(0, maxLen) + '...' : text;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Fraud History</h1>
        <p className="page-subtitle">Complete history of your fraud detection scans</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <select className="form-select" value={filters.type}
              onChange={e => setFilters({ ...filters, type: e.target.value, page: 1 })}>
              <option value="">All Types</option>
              <option value="text">💬 SMS/Text</option>
              <option value="image">🖼️ Screenshot</option>
              <option value="transaction">💳 Transaction</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <select className="form-select" value={filters.riskLevel}
              onChange={e => setFilters({ ...filters, riskLevel: e.target.value, page: 1 })}>
              <option value="">All Risk Levels</option>
              <option value="High">🚨 High Risk</option>
              <option value="Medium">⚠️ Medium Risk</option>
              <option value="Low">✅ Low Risk</option>
            </select>
          </div>
          <button className="btn btn-outline btn-sm"
            onClick={() => setFilters({ type: '', riskLevel: '', page: 1 })}>
            ✕ Clear Filters
          </button>
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
            {pagination.total || 0} total records
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20
        }} onClick={() => setSelectedReport(null)}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 28, maxWidth: 560, width: '100%',
            maxHeight: '80vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>
                {TYPE_ICONS[selectedReport.type]} Report Details
              </h3>
              <button onClick={() => setSelectedReport(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Score */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                fontSize: 52, fontWeight: 800,
                color: RISK_COLORS[selectedReport.result.riskLevel]
              }}>
                {selectedReport.result.riskScore}%
              </div>
              <span className={`risk-badge ${selectedReport.result.riskLevel.toLowerCase()}`}>
                {selectedReport.result.riskLevel} Risk
              </span>
            </div>

            {/* Details */}
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Type</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{TYPE_LABELS[selectedReport.type]}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Label</span>
                <span className={`risk-badge ${selectedReport.result.label === 'SCAM' ? 'scam' : 'safe'}`}>
                  {selectedReport.result.label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Confidence</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedReport.result.confidence || 'N/A'}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Date</span>
                <span style={{ fontSize: 13 }}>{new Date(selectedReport.createdAt).toLocaleString()}</span>
              </div>

              {selectedReport.result.explanation && (
                <div style={{ padding: '12px', background: 'var(--bg-primary)', borderRadius: 8, marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>ANALYSIS:</div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {selectedReport.result.explanation}
                  </p>
                </div>
              )}

              {selectedReport.result.patterns?.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>DETECTED PATTERNS:</div>
                  <div>
                    {selectedReport.result.patterns.map((p, i) => (
                      <span key={i} className="pattern-tag">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReport.inputData?.text && (
                <div style={{ padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>ANALYZED TEXT:</div>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{truncateText(selectedReport.inputData.text, 200)}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="card">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="loading-spinner" style={{ width: 32, height: 32 }}></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-title">No reports found</div>
            <div className="empty-state-desc">
              {filters.type || filters.riskLevel ? 'Try clearing your filters' : 'Start scanning to see your history here'}
            </div>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Content Preview</th>
                    <th>Risk Score</th>
                    <th>Risk Level</th>
                    <th>Label</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr key={report._id}>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {TYPE_ICONS[report.type]} {TYPE_LABELS[report.type]}
                        </span>
                      </td>
                      <td style={{ maxWidth: 200 }}>
                        <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          {report.type === 'text' && truncateText(report.inputData?.text)}
                          {report.type === 'image' && `📸 ${report.inputData?.imageOriginalName || 'Image'}`}
                          {report.type === 'transaction' && `$${report.inputData?.transactionDetails?.amount} — ${report.inputData?.transactionDetails?.merchantCategory}`}
                        </span>
                      </td>
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
                      <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setSelectedReport(report)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
                <button className="btn btn-outline btn-sm"
                  disabled={filters.page === 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
                  ← Previous
                </button>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button className="btn btn-outline btn-sm"
                  disabled={filters.page >= pagination.pages}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FraudHistory;
