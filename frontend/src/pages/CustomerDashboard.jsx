import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Calendar, Clock, User, Phone, Mail, Award, XCircle, AlertCircle } from 'lucide-react';

const CustomerDashboard = () => {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error: dbErr } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_price,
          notes,
          services (
            name,
            category,
            duration_mins
          )
        `)
        .eq('customer_id', user.id)
        .order('booking_date', { ascending: false });

      if (dbErr) throw dbErr;

      setBookings(data || []);
    } catch (err) {
      console.warn("Could not fetch bookings from DB, loading local mock data.", err);
      // Load local storage bookings
      const local = JSON.parse(localStorage.getItem('ashly_local_bookings') || '[]');
      const filtered = local.filter(b => b.customer_id === user.id);
      setBookings(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      // Check if it's a local storage booking
      if (typeof bookingId === 'string' && bookingId.startsWith('b-')) {
        const local = JSON.parse(localStorage.getItem('ashly_local_bookings') || '[]');
        const updated = local.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b);
        localStorage.setItem('ashly_local_bookings', JSON.stringify(updated));
        // Refresh local bookings list
        const filtered = updated.filter(b => b.customer_id === user.id);
        setBookings(filtered);
        return;
      }

      const { error: cancelErr } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (cancelErr) throw cancelErr;
      fetchBookings();
    } catch (err) {
      setError('Failed to cancel the booking. Please try again.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: '#eefcf3', color: '#2d7a43', border: '1px solid #ccecd5' };
      case 'cancelled':
        return { backgroundColor: '#fff5f5', color: '#cf7c7c', border: '1px solid #ffc9c9' };
      case 'completed':
        return { backgroundColor: '#f0f7ff', color: '#1e40af', border: '1px solid #bfdbfe' };
      default:
        return { backgroundColor: '#fffdf5', color: '#b45309', border: '1px solid #fde68a' };
    }
  };

  return (
    <div style={styles.page}>
      <div className="container" style={styles.container}>
        <div style={styles.welcomeSection}>
          <h1 style={styles.title}>Hello, {profile?.name || 'Valued Guest'}</h1>
          <p style={styles.subtitle}>View your upcoming appointments, billing details, and treatment history.</p>
        </div>

        <div style={styles.grid}>
          {/* Profile Card */}
          <div style={styles.profileCard} className="premium-card">
            <div style={styles.profileHeader}>
              <div style={styles.avatar}>
                {profile?.name ? profile.name.charAt(0).toUpperCase() : <User size={24} />}
              </div>
              <div>
                <h3 style={styles.profileName}>{profile?.name || 'Guest User'}</h3>
                <span style={styles.roleBadge}>{profile?.role || 'Customer'}</span>
              </div>
            </div>
            <hr style={styles.divider} />
            <div style={styles.profileDetails}>
              <div style={styles.detailItem}>
                <Mail size={16} color="var(--accent)" />
                <div>
                  <span style={styles.detailLabel}>Email</span>
                  <span style={styles.detailValue}>{profile?.email || user?.email}</span>
                </div>
              </div>
              <div style={styles.detailItem}>
                <Phone size={16} color="var(--accent)" />
                <div>
                  <span style={styles.detailLabel}>Phone</span>
                  <span style={styles.detailValue}>{profile?.phone || 'No phone provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bookings Card */}
          <div style={styles.bookingsSection}>
            <h2 style={styles.sectionTitle}>Your Appointments</h2>
            {error && <div style={styles.errorBox}>{error}</div>}

            {loading ? (
              <p>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div style={styles.noBookings} className="premium-card">
                <Calendar size={40} color="var(--accent)" />
                <h3>No Appointments Yet</h3>
                <p>Relax and indulge yourself. Book a session with our styling experts today.</p>
              </div>
            ) : (
              <div style={styles.bookingsList}>
                {bookings.map(booking => {
                  const serviceName = booking.services?.name || booking.serviceName || 'Premium Ritual';
                  const serviceCategory = booking.services?.category || 'General';
                  const serviceDuration = booking.services?.duration_mins || 45;

                  return (
                    <div key={booking.id} className="premium-card" style={styles.bookingCard}>
                      <div style={styles.bookingHeader}>
                        <div>
                          <h4 style={styles.bookingTitle}>{serviceName}</h4>
                          <span style={styles.categoryTag}>{serviceCategory}</span>
                        </div>
                        <span style={{ ...styles.statusBadge, ...getStatusStyle(booking.status) }}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      <div style={styles.bookingMeta}>
                        <div style={styles.metaItem}>
                          <Calendar size={16} color="var(--accent)" />
                          <span>{booking.booking_date}</span>
                        </div>
                        <div style={styles.metaItem}>
                          <Clock size={16} color="var(--accent)" />
                          <span>{booking.booking_time} ({serviceDuration} mins)</span>
                        </div>
                      </div>

                      {booking.notes && (
                        <p style={styles.notes}>
                          <strong>Notes:</strong> {booking.notes}
                        </p>
                      )}

                      <div style={styles.bookingFooter}>
                        <span style={styles.price}>Total: ₹{parseFloat(booking.total_price).toFixed(2)}</span>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            style={styles.cancelBtn}
                          >
                            <XCircle size={16} /> Cancel Session
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    padding: '3rem 0',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  welcomeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  title: {
    fontSize: '2.25rem',
  },
  subtitle: {
    color: 'var(--text-muted)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2.5rem',
    alignItems: 'start',
    '@media (min-width: 992px)': {
      gridTemplateColumns: '1fr 2.2fr',
    },
  },
  profileCard: {
    padding: '2rem',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  avatar: {
    width: '56px',
    height: '56px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  profileName: {
    fontSize: '1.25rem',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    fontWeight: '700',
    color: 'var(--accent)',
    letterSpacing: '1px',
    marginTop: '0.25rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--border-color)',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  detailItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  detailLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  bookingsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontFamily: 'var(--font-heading)',
  },
  noBookings: {
    padding: '3rem 2rem',
    textAlign: 'center',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  bookingCard: {
    padding: '1.75rem',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  bookingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bookingTitle: {
    fontSize: '1.2rem',
    fontFamily: 'var(--font-heading)',
  },
  categoryTag: {
    display: 'inline-block',
    fontSize: '0.75rem',
    color: 'var(--accent)',
    fontWeight: '600',
    marginTop: '0.25rem',
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    letterSpacing: '0.5px',
  },
  bookingMeta: {
    display: 'flex',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  notes: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-beige)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '2px solid var(--accent)',
  },
  bookingFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid rgba(0,0,0,0.03)',
  },
  price: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'var(--text-dark)',
  },
  cancelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'none',
    border: 'none',
    color: 'var(--danger)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    border: '1px solid #ffc9c9',
    color: 'var(--danger)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
  },
};

export default CustomerDashboard;
