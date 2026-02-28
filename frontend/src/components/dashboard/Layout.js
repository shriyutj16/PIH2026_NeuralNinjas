import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/detect/text', icon: '💬', label: 'SMS / Text Scan' },
    { path: '/detect/image', icon: '🖼️', label: 'Screenshot Scan' },
    { path: '/detect/transaction', icon: '💳', label: 'Transaction Risk' },
    { path: '/history', icon: '📋', label: 'Fraud History' },
    { path: '/profile', icon: '👤', label: 'My Profile' },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🛡️</div>
          <div>
            <h1>Fraud Shield</h1>
            <span>AI Protection</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Main Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="nav-section-title" style={{ marginTop: 12 }}>Administration</div>
              <NavLink
                to="/admin"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">⚙️</span>
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div
            className="user-avatar"
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
            title="View Profile"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role === 'admin' ? '👑 Admin' : '👤 User'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;