import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sparkles, User, LogOut, Calendar, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const { user, profile, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
  ];

  return (
    <header style={styles.header}>
      <div className="container" style={styles.container}>
        <Link to="/" style={styles.logoContainer}>
          <Sparkles size={24} color="var(--accent)" />
          <span style={styles.logoText}>ASHLY'S <span style={styles.logoSub}>Saloon</span></span>
        </Link>

        {/* Desktop Menu */}
        <nav className="desktop-nav">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} style={styles.link}>
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              {profile?.role === 'admin' ? (
                <Link to="/admin" style={styles.linkBtn}>
                  <LayoutDashboard size={16} /> Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/booking" style={styles.linkBtn}>
                    <Calendar size={16} /> Book Service
                  </Link>
                  <Link to="/dashboard" style={styles.linkBtn}>
                    <User size={16} /> My Dashboard
                  </Link>
                </>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div style={styles.authGroup}>
              <Link to="/login" style={styles.loginBtn}>Login</Link>
              <Link to="/register" style={styles.registerBtn}>Sign Up</Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button onClick={() => setIsOpen(!isOpen)} className="mobile-menu-btn">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={styles.mobileDrawer}>
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              style={styles.mobileLink}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              {profile?.role === 'admin' ? (
                <Link
                  to="/admin"
                  style={styles.mobileLink}
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/booking"
                    style={styles.mobileLink}
                    onClick={() => setIsOpen(false)}
                  >
                    Book Service
                  </Link>
                  <Link
                    to="/dashboard"
                    style={styles.mobileLink}
                    onClick={() => setIsOpen(false)}
                  >
                    My Dashboard
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                style={styles.mobileLogoutBtn}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={styles.mobileAuthGroup}>
              <Link
                to="/login"
                style={styles.mobileLink}
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={styles.mobileRegisterBtn}
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '70px',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-dark)',
    letterSpacing: '1px',
  },
  logoSub: {
    color: 'var(--primary)',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  desktopNav: {
    alignItems: 'center',
    gap: '1.5rem',
  },
  link: {
    fontWeight: '500',
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    padding: '0.25rem 0',
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    color: 'var(--primary)',
    backgroundColor: 'var(--primary-light)',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-full)',
  },
  logoutBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  loginBtn: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: 'var(--text-dark)',
  },
  registerBtn: {
    backgroundColor: 'var(--primary)',
    color: 'var(--secondary)',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    fontSize: '0.95rem',
    boxShadow: '0 4px 10px rgba(212, 131, 143, 0.2)',
  },
  mobileMenuBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dark)',
    cursor: 'pointer',
  },
  mobileDrawer: {
    position: 'absolute',
    top: '70px',
    left: 0,
    width: '100%',
    backgroundColor: 'var(--secondary)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    gap: '1rem',
    boxShadow: 'var(--shadow-md)',
  },
  mobileLink: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'var(--text-dark)',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(0,0,0,0.03)',
  },
  mobileLogoutBtn: {
    background: 'none',
    border: 'none',
    textAlign: 'left',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: 'var(--danger)',
    padding: '0.5rem 0',
    cursor: 'pointer',
  },
  mobileAuthGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  mobileRegisterBtn: {
    backgroundColor: 'var(--primary)',
    color: 'var(--secondary)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    fontWeight: '600',
  },
};

// Simple media query handler for CSS in JS (fallback styling)
const injectResponsiveStyles = () => {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @media (min-width: 768px) {
      header nav {
        display: flex !important;
      }
      header button[style*="mobileMenuBtn"] {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(styleTag);
};
if (typeof window !== 'undefined') {
  injectResponsiveStyles();
}

export default Header;
