import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      // Wait briefly for profile fetch
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="premium-card animate-fade-in">
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Sparkles size={24} color="var(--accent)" />
          </div>
          <h2 style={styles.title}>Welcome to ASHLY'S</h2>
          <p style={styles.subtitle}>Enter your details to access your booking dashboard</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.passwordHeader}>
              <label style={styles.label}>Password</label>
              <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don't have an account?</span>{' '}
          <Link to="/register" style={styles.signupLink}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '2rem 1.5rem',
  },
  card: {
    maxWidth: '450px',
    width: '100%',
    padding: '3rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    backgroundColor: 'var(--secondary)',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconCircle: {
    width: '50px',
    height: '50px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.25rem',
  },
  title: {
    fontSize: '1.8rem',
    color: 'var(--text-dark)',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#fff5f5',
    border: '1px solid #ffc9c9',
    color: 'var(--danger)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
  },
  forgotLink: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--accent)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    backgroundColor: 'var(--bg-beige)',
    color: 'var(--text-dark)',
    transition: 'var(--transition)',
    outline: 'none',
    '&:focus': {
      borderColor: 'var(--primary)',
      backgroundColor: 'var(--secondary)',
    }
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  footer: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  signupLink: {
    fontWeight: '700',
    color: 'var(--primary)',
  },
};

export default Login;
