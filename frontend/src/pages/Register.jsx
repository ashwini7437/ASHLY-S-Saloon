import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle, Sparkles, Shield } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(email, password, name, phone, role);
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Registration failed. Try using a different email.');
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
          <h2 style={styles.title}>Join ASHLY'S</h2>
          <p style={styles.subtitle}>Create a personal account for premium salon bookings</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            <span>Registration successful! Redirecting you to login...</span>
          </div>
        )}

        {!success && (
          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.inputWrapper}>
                <Phone size={18} style={styles.inputIcon} />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
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

            <div style={styles.inputGroup}>
              <label style={styles.label}>Account Role</label>
              <div style={styles.roleWrapper}>
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  style={{
                    ...styles.roleBtn,
                    ...(role === 'customer' ? styles.activeRoleBtn : {})
                  }}
                >
                  Customer Account
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  style={{
                    ...styles.roleBtn,
                    ...(role === 'admin' ? styles.activeRoleBtn : {})
                  }}
                >
                  <Shield size={14} style={{ marginRight: '4px' }} /> Admin Account
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <span>Already have an account?</span>{' '}
          <Link to="/login" style={styles.loginLink}>Login</Link>
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
    maxWidth: '480px',
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
  successBox: {
    backgroundColor: '#f4fbf6',
    border: '1px solid #ccecd5',
    color: 'var(--success)',
    padding: '1.25rem',
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
  roleWrapper: {
    display: 'flex',
    gap: '0.5rem',
  },
  roleBtn: {
    flex: 1,
    padding: '0.6rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    backgroundColor: 'var(--bg-beige)',
    border: '1.5px solid var(--border-color)',
    color: 'var(--text-muted)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRoleBtn: {
    backgroundColor: 'var(--primary-light)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
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
  loginLink: {
    fontWeight: '700',
    color: 'var(--primary)',
  },
};

export default Register;
