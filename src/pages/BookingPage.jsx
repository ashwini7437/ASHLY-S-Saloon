import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Calendar, Clock, MessageSquare, CreditCard, Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';

const SERVICES = [
  { id: 's1', name: 'Luxury Royal Haircut', category: 'Haircut', duration_mins: 45, price: 999.00, discount_percent: 10 },
  { id: 's2', name: 'Gold Radiance Facial', category: 'Facial', duration_mins: 60, price: 2499.00, discount_percent: 15 },
  { id: 's3', name: 'Bridal Nail Art & Gel Polish', category: 'Nail Art', duration_mins: 50, price: 1999.00, discount_percent: 0 },
  { id: 's4', name: 'Moroccan Hair Spa', category: 'Hair Spa', duration_mins: 60, price: 1799.00, discount_percent: 20 },
  { id: 's5', name: 'Premium Keratin Complex', category: 'Keratin Treatment', duration_mins: 120, price: 4999.00, discount_percent: 15 },
  { id: 's6', name: 'Luxe Body Polishing', category: 'Body Polishing', duration_mins: 90, price: 3499.00, discount_percent: 10 },
];

const BookingPage = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dbServices, setDbServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase.from('services').select('*');
      if (!error && data && data.length > 0) {
        setDbServices(data);
      } else {
        setDbServices(SERVICES);
      }
    } catch (err) {
      setDbServices(SERVICES);
    }
  };

  useEffect(() => {
    if (dbServices.length > 0) {
      const stateService = location.state?.preselectedService;
      if (stateService) {
        const found = dbServices.find(s => s.id === stateService.id);
        setSelectedService(found || dbServices[0]);
      } else {
        setSelectedService(dbServices[0]);
      }
    }
  }, [dbServices, location.state]);

  const calculateFinalPrice = () => {
    if (!selectedService) return 0;
    const price = parseFloat(selectedService.price);
    const discount = parseFloat(selectedService.discount_percent || 0);
    return (price * (1 - discount / 100)).toFixed(2);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login with current state to return after auth
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    setError('');

    const bookingData = {
      customer_id: user.id,
      service_id: selectedService.id,
      booking_date: date,
      booking_time: time,
      status: 'pending',
      total_price: parseFloat(calculateFinalPrice()),
      notes: notes,
    };

    try {
      const { error: dbErr } = await supabase.from('bookings').insert([bookingData]);
      if (dbErr) throw dbErr;

      setSuccess(true);
    } catch (err) {
      console.warn("Database storage failed, falling back to local simulation.", err);
      // Fallback local storage for offline / unseeded dev testing
      const localBookings = JSON.parse(localStorage.getItem('ashly_local_bookings') || '[]');
      const newBooking = {
        id: 'b-' + Date.now(),
        ...bookingData,
        created_at: new Date().toISOString(),
        serviceName: selectedService.name,
        customerName: profile?.name || user.email
      };
      localStorage.setItem('ashly_local_bookings', JSON.stringify([newBooking, ...localBookings]));
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for minimum input validation
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (success) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard} className="premium-card animate-fade-in">
          <CheckCircle size={60} color="var(--success)" />
          <h2 style={styles.successTitle}>Booking Requested!</h2>
          <p style={styles.successSub}>
            Your luxury session for <strong>{selectedService?.name}</strong> on {date} at {time} has been submitted.
          </p>
          <div style={styles.successDetails}>
            <p>We are verifying your appointment. You can track status on your dashboard.</p>
          </div>
          <div style={styles.successActions}>
            <button onClick={() => navigate('/dashboard')} className="btn-primary">
              Go to Dashboard
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div className="container" style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={styles.grid}>
          {/* Form Side */}
          <div style={styles.formCard} className="premium-card">
            <h2 style={styles.title}>Book Your Ritual</h2>
            <p style={styles.subtitle}>Select your preferred timing and custom requests</p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <form onSubmit={handleBooking} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Service</label>
                <select
                  value={selectedService?.id || ''}
                  onChange={(e) => {
                    const found = dbServices.find(s => s.id === e.target.value);
                    setSelectedService(found);
                  }}
                  style={styles.select}
                >
                  {dbServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.row}>
                <div style={styles.inputGroup} className="col">
                  <label style={styles.label}>Date</label>
                  <div style={styles.inputWrapper}>
                    <Calendar size={18} style={styles.inputIcon} />
                    <input
                      type="date"
                      required
                      min={getMinDate()}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.inputGroup} className="col">
                  <label style={styles.label}>Time Slot</label>
                  <div style={styles.inputWrapper}>
                    <Clock size={18} style={styles.inputIcon} />
                    <select
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      style={styles.selectWithIcon}
                    >
                      <option value="">Choose a slot</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Special Requests / Notes</label>
                <div style={styles.textareaWrapper}>
                  <MessageSquare size={18} style={styles.textareaIcon} />
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify styling requests, allergies, or other details..."
                    style={styles.textarea}
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={styles.submitBtn}>
                {loading ? 'Processing Booking...' : user ? 'Confirm Appointment' : 'Sign In to Book'}
              </button>
            </form>
          </div>

          {/* Pricing Side */}
          <div style={styles.pricingCard} className="premium-card">
            <h3 style={styles.pricingTitle}>Summary</h3>
            {selectedService && (
              <div style={styles.summaryContent}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Treatment:</span>
                  <span style={styles.summaryValue}>{selectedService.name}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Category:</span>
                  <span style={styles.summaryValue}>{selectedService.category}</span>
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Duration:</span>
                  <span style={styles.summaryValue}>{selectedService.duration_mins} mins</span>
                </div>
                {parseFloat(selectedService.discount_percent || 0) > 0 && (
                  <div style={styles.summaryRow}>
                    <span style={styles.summaryLabel}>Discount:</span>
                    <span style={styles.discountText}>-{selectedService.discount_percent}%</span>
                  </div>
                )}
                <hr style={styles.divider} />
                <div style={styles.totalRow}>
                  <span>Total Amount</span>
                  <span style={styles.totalVal}>₹{calculateFinalPrice()}</span>
                </div>
              </div>
            )}
            <div style={styles.pricingFooter}>
              <CreditCard size={16} color="var(--accent)" />
              <span>Pay at the salon after service</span>
            </div>
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
    gap: '2rem',
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
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '2rem',
    alignItems: 'start',
    '@media (min-width: 992px)': {
      gridTemplateColumns: '2fr 1fr',
    },
  },
  formCard: {
    padding: '2.5rem',
    backgroundColor: 'var(--secondary)',
  },
  title: {
    fontSize: '1.75rem',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  row: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flexGrow: 1,
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    backgroundColor: 'var(--bg-beige)',
    outline: 'none',
  },
  selectWithIcon: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    backgroundColor: 'var(--bg-beige)',
    outline: 'none',
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
    outline: 'none',
  },
  textareaWrapper: {
    position: 'relative',
  },
  textareaIcon: {
    position: 'absolute',
    left: '1rem',
    top: '1rem',
    color: 'var(--text-muted)',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    backgroundColor: 'var(--bg-beige)',
    outline: 'none',
    resize: 'vertical',
  },
  submitBtn: {
    marginTop: '1rem',
    justifyContent: 'center',
  },
  pricingCard: {
    padding: '2rem',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  pricingTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.3rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.75rem',
  },
  summaryContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
  },
  summaryLabel: {
    color: 'var(--text-muted)',
  },
  summaryValue: {
    fontWeight: '600',
  },
  discountText: {
    color: 'var(--danger)',
    fontWeight: '700',
  },
  divider: {
    border: 'none',
    borderTop: '1.5px dashed var(--border-color)',
    margin: '0.5rem 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  totalVal: {
    color: 'var(--primary)',
  },
  pricingFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  successContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '70vh',
    padding: '2rem',
  },
  successCard: {
    maxWidth: '500px',
    width: '100%',
    padding: '3rem 2.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    backgroundColor: 'var(--secondary)',
  },
  successTitle: {
    fontSize: '2rem',
  },
  successSub: {
    fontSize: '1rem',
    color: 'var(--text-muted)',
  },
  successDetails: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    backgroundColor: 'var(--bg-beige)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    width: '100%',
  },
  successActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    border: '1px solid #ffc9c9',
    color: 'var(--danger)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  },
};

const injectBookingStyles = () => {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @media (max-width: 768px) {
      .col {
        flex: 0 0 100% !important;
      }
    }
  `;
  document.head.appendChild(styleTag);
};
if (typeof window !== 'undefined') {
  injectBookingStyles();
}

export default BookingPage;
