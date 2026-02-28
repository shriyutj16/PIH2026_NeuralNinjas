import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfilePage = () => {
    const { user, API, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState(null);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg(null);
        try {
            const { data } = await API.put('/auth/profile', profileForm);
            updateUser(data.user);
            setProfileMsg({ type: 'success', text: '✅ Profile updated successfully!' });
        } catch (err) {
            setProfileMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
        }
        if (passwordForm.newPassword.length < 6) {
            return setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
        }
        setPasswordLoading(true);
        setPasswordMsg(null);
        try {
            await API.put('/auth/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordMsg({ type: 'success', text: '✅ Password changed successfully!' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setPasswordMsg({ type: 'error', text: err.response?.data?.message || 'Password change failed' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const getPasswordStrength = (p) => {
        let strength = 0;
        if (p.length >= 6) strength++;
        if (p.length >= 10) strength++;
        if (/[A-Z]/.test(p)) strength++;
        if (/[0-9]/.test(p)) strength++;
        if (/[^A-Za-z0-9]/.test(p)) strength++;
        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const colors = ['', '#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'];
        return { strength, label: labels[strength], color: colors[strength] };
    };

    const tabs = [
        { id: 'profile', icon: '👤', label: 'Profile Info' },
        { id: 'password', icon: '🔐', label: 'Change Password' },
        { id: 'stats', icon: '📊', label: 'My Stats' },
    ];

    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const lastLogin = user?.lastLogin
        ? new Date(user.lastLogin).toLocaleString()
        : 'N/A';

    const safeScans = Math.max((user?.totalScans || 0) - (user?.scamsDetected || 0), 0);
    const detectionRate = user?.totalScans > 0
        ? Math.round((user?.scamsDetected / user?.totalScans) * 100)
        : 0;
    const safeRate = user?.totalScans > 0
        ? Math.round((safeScans / user?.totalScans) * 100)
        : 100;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">👤 My Profile</h1>
                <p className="page-subtitle">Manage your account settings and preferences</p>
            </div>

            {/* Profile Header Card */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 32, fontWeight: 700, color: 'white', flexShrink: 0,
                        boxShadow: '0 0 20px rgba(99,102,241,0.4)'
                    }}>
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`risk-badge ${user?.role === 'admin' ? 'medium' : 'safe'}`}>
                                {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                            </span>
                            <span className="risk-badge safe">✅ Active Account</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                📅 Joined {joinedDate}
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {[
                            { label: 'Total Scans', value: user?.totalScans || 0, icon: '🔍', color: 'var(--primary-light)' },
                            { label: 'Scams Found', value: user?.scamsDetected || 0, icon: '🚨', color: 'var(--risk-high)' },
                            { label: 'Safe Scans', value: safeScans, icon: '✅', color: 'var(--risk-low)' },
                        ].map((stat, i) => (
                            <div key={i} style={{
                                textAlign: 'center', padding: '12px 20px',
                                background: 'var(--bg-primary)', borderRadius: 10,
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ fontSize: 22 }}>{stat.icon}</div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', gap: 4, marginBottom: 20,
                background: 'var(--bg-secondary)', padding: 6,
                borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)'
            }}>
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '8px 18px', borderRadius: 7, border: 'none', cursor: 'pointer',
                        background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                        color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                        fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                        display: 'flex', alignItems: 'center', gap: 6
                    }}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="grid-2" style={{ alignItems: 'start' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">✏️ Edit Profile</h3>
                        </div>
                        {profileMsg && (
                            <div className={`alert-banner ${profileMsg.type === 'success' ? 'info' : 'medium'}`} style={{ marginBottom: 16 }}>
                                <span className="alert-icon">{profileMsg.type === 'success' ? '✅' : '⚠️'}</span>
                                <div className="alert-content"><p>{profileMsg.text}</p></div>
                            </div>
                        )}
                        <form onSubmit={handleProfileSave}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input"
                                    value={profileForm.name}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                    placeholder="Your full name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-input"
                                    value={profileForm.email}
                                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                    placeholder="your@email.com" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <input type="text" className="form-input"
                                    value={user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                                    disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                                {profileLoading
                                    ? <><span className="loading-spinner"></span> Saving...</>
                                    : '💾 Save Changes'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">ℹ️ Account Details</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {[
                                { label: 'Account ID', value: user?._id || user?.id, mono: true },
                                { label: 'Member Since', value: joinedDate },
                                { label: 'Last Login', value: lastLogin },
                                { label: 'Account Status', value: '✅ Active' },
                                { label: 'Role', value: user?.role === 'admin' ? '👑 Administrator' : '👤 Standard User' },
                                { label: 'Total Scans', value: user?.totalScans || 0 },
                                { label: 'Scams Detected', value: user?.scamsDetected || 0 },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '12px 0', borderBottom: '1px solid var(--border)'
                                }}>
                                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                                    <span style={{
                                        fontSize: item.mono ? 11 : 13,
                                        color: 'var(--text-primary)', fontWeight: 500,
                                        fontFamily: item.mono ? 'monospace' : 'inherit'
                                    }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="grid-2" style={{ alignItems: 'start' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🔐 Change Password</h3>
                        </div>
                        {passwordMsg && (
                            <div className={`alert-banner ${passwordMsg.type === 'success' ? 'info' : 'medium'}`} style={{ marginBottom: 16 }}>
                                <span className="alert-icon">{passwordMsg.type === 'success' ? '✅' : '⚠️'}</span>
                                <div className="alert-content"><p>{passwordMsg.text}</p></div>
                            </div>
                        )}
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input type="password" className="form-input"
                                    value={passwordForm.currentPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    placeholder="Enter current password" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input type="password" className="form-input"
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Min. 6 characters" required />
                            </div>

                            {/* Password strength */}
                            {passwordForm.newPassword && (() => {
                                const { strength, label, color } = getPasswordStrength(passwordForm.newPassword);
                                return (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Password Strength:</div>
                                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} style={{
                                                    flex: 1, height: 4, borderRadius: 2,
                                                    background: i <= strength ? color : 'var(--border)',
                                                    transition: 'background 0.3s'
                                                }}></div>
                                            ))}
                                        </div>
                                        <div style={{ fontSize: 11, color }}>{label}</div>
                                    </div>
                                );
                            })()}

                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input type="password" className="form-input"
                                    value={passwordForm.confirmPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    placeholder="Repeat new password" required />
                            </div>

                            {/* Match indicator */}
                            {passwordForm.confirmPassword && (
                                <div style={{ marginBottom: 16, fontSize: 12, color: passwordForm.newPassword === passwordForm.confirmPassword ? '#22c55e' : '#ef4444' }}>
                                    {passwordForm.newPassword === passwordForm.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                                {passwordLoading
                                    ? <><span className="loading-spinner"></span> Changing...</>
                                    : '🔐 Change Password'}
                            </button>
                        </form>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">💡 Password Tips</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {[
                                { icon: '✅', tip: 'Use at least 8 characters' },
                                { icon: '✅', tip: 'Include uppercase and lowercase letters' },
                                { icon: '✅', tip: 'Add numbers and special characters (!@#$)' },
                                { icon: '❌', tip: "Don't use your name or email in the password" },
                                { icon: '❌', tip: 'Avoid common words like "password" or "123456"' },
                                { icon: '❌', tip: "Don't reuse passwords from other sites" },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                                    <span>{item.icon}</span><span>{item.tip}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 20, padding: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
                            <div style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>⚠️ Security Warning</div>
                            <div style={{ fontSize: 12, color: '#fca5a5', opacity: 0.8 }}>
                                Never share your password. Fraud Shield staff will never ask for your password.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div>
                    <div className="grid-4" style={{ marginBottom: 24 }}>
                        {[
                            { icon: '🔍', label: 'Total Scans', value: user?.totalScans || 0, color: 'blue' },
                            { icon: '🚨', label: 'Scams Detected', value: user?.scamsDetected || 0, color: 'red' },
                            { icon: '✅', label: 'Safe Scans', value: safeScans, color: 'green' },
                            { icon: '📈', label: 'Detection Rate', value: `${detectionRate}%`, color: 'yellow' },
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

                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">🏆 Protection Summary</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {[
                                {
                                    label: 'Scam Detection Rate',
                                    value: detectionRate,
                                    color: 'var(--risk-high)',
                                    desc: 'Percentage of your scans that were threats'
                                },
                                {
                                    label: 'Safe Scan Rate',
                                    value: safeRate,
                                    color: 'var(--risk-low)',
                                    desc: 'Percentage of your scans that were clean'
                                },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                                        </div>
                                        <span style={{ color: item.color, fontWeight: 700, fontSize: 22 }}>{item.value}%</span>
                                    </div>
                                    <div className="risk-progress-container" style={{ height: 8 }}>
                                        <div style={{
                                            height: '100%', borderRadius: 4,
                                            width: `${item.value}%`,
                                            background: item.color,
                                            transition: 'width 1s ease'
                                        }}></div>
                                    </div>
                                </div>
                            ))}

                            {/* Activity breakdown */}
                            <div style={{ marginTop: 8, padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>📋 Scan Breakdown</div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {[
                                        { label: 'High Risk', count: user?.scamsDetected || 0, color: 'var(--risk-high)' },
                                        { label: 'Safe', count: safeScans, color: 'var(--risk-low)' },
                                        { label: 'Total', count: user?.totalScans || 0, color: 'var(--primary-light)' },
                                    ].map((item, i) => (
                                        <div key={i} style={{
                                            flex: 1, minWidth: 80, textAlign: 'center',
                                            padding: '12px 8px', background: 'var(--bg-secondary)',
                                            borderRadius: 8, border: '1px solid var(--border)'
                                        }}>
                                            <div style={{ fontSize: 24, fontWeight: 700, color: item.color }}>{item.count}</div>
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;``