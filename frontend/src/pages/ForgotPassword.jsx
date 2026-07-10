import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send recovery email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="premium-card animate-fade-in">
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div style={styles.header}>
          <h2 style={styles.title}>Password Recovery</h2>
          <p style={styles.subtitle}>Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div style={styles.successBox}>
            <CheckCircle size={32} color="var(--success)" />
            <p>Recovery email has been dispatched. Please review your email inbox.</p>
            <Link to="/login" style={styles.loginBtn}>Return to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleReset} style={styles.form}>
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

            <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
              {loading ? 'Sending Recovery...' : 'Send Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '75vh',
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
  backBtn: {
    alignSelf: 'flex-start',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
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
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#f4fbf6',
    border: '1px solid #ccecd5',
    color: 'var(--success)',
    padding: '2rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    fontSize: '0.95rem',
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
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-dark)',
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
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '0.5rem',
  },
  loginBtn: {
    marginTop: '1rem',
    fontWeight: '700',
    color: 'var(--primary)',
  },
};

export default ForgotPassword;
