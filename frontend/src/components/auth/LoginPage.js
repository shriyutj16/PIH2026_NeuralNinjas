import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const result = await login(form.email, form.password);
    if (result.success) navigate('/dashboard');
    else setError(result.message);
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🛡️</div>
          <h1>Fraud Shield</h1>
          <p>Sign in to your protected account</p>
        </div>

        {error && (
          <div className="alert-banner medium" style={{ marginBottom: 20 }}>
            <span className="alert-icon">⚠️</span>
            <div className="alert-content"><p>{error}</p></div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              required />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <><span className="loading-spinner"></span> Signing in...</> : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-divider"><span>New here?</span></div>
        <Link to="/register" className="btn btn-outline btn-full" style={{ justifyContent: 'center' }}>
          Create an Account
        </Link>

        <div className="demo-hint">
          <strong>Demo Access:</strong><br />
          admin@fraudshield.com / Admin@123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;