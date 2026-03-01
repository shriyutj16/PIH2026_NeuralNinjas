import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  // Close sidebar on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.hamburger')) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarOpen]);

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

      {/* Animated Background */}
      <div className="bg-scene">
        <canvas id="bg-canvas"></canvas>
        <div className="bg-grid"></div>
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle menu">
          <span className={`ham-line ${sidebarOpen ? 'open' : ''}`}></span>
          <span className={`ham-line ${sidebarOpen ? 'open' : ''}`}></span>
          <span className={`ham-line ${sidebarOpen ? 'open' : ''}`}></span>
        </button>
        <div className="mobile-logo" onClick={() => navigate('/dashboard')}>
          <span className="mobile-logo-icon">🛡️</span>
          <span className="mobile-logo-text">Fraud Shield</span>
        </div>
        <div className="mobile-avatar" onClick={() => navigate('/profile')}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
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
          <div className="user-avatar" onClick={() => navigate('/profile')} title="View Profile">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-info" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role === 'admin' ? '👑 Admin' : '👤 User'}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">🚪</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      <BgCanvas />
    </div>
  );
};

const BgCanvas = () => {
  React.useEffect(() => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    const NUM = 55;
    const particles = Array.from({ length: NUM }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,212,255,${0.08 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,212,255,${p.alpha})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);
  return null;
};

export default Layout;