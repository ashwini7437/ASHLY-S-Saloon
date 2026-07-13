import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Calendar, Search, Users, Sparkles, IndianRupee, CheckCircle2, XCircle, AlertCircle, ShoppingBag, PlusCircle, Trash, Star, Edit } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard view states
  const [activeTab, setActiveTab] = useState('bookings'); // bookings, customers, services, offers, reviews
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states for adding items
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('Haircut');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDiscount, setNewServiceDiscount] = useState(0);

  const [newOfferTitle, setNewOfferTitle] = useState('');
  const [newOfferDesc, setNewOfferDesc] = useState('');
  const [newOfferDiscount, setNewOfferDiscount] = useState(10);
  const [newOfferValidUntil, setNewOfferValidUntil] = useState('');
  const [editingOfferId, setEditingOfferId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch bookings
      const { data: dbBookings, error: bErr } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_price,
          notes,
          profiles (name, email, phone),
          services (name, category)
        `)
        .order('booking_date', { ascending: false });

      // 2. Fetch customers (profiles with customer role)
      const { data: dbCustomers, error: cErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'customer');

      // 3. Fetch services
      const { data: dbServices, error: sErr } = await supabase
        .from('services')
        .select('*');

      // 4. Fetch offers
      const { data: dbOffers, error: oErr } = await supabase
        .from('offers')
        .select('*');

      // 5. Fetch reviews
      const { data: dbReviews, error: rErr } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          profiles (name),
          services (name)
        `);

      // Resolve database or fallbacks
      let finalBookings = dbBookings || [];
      let finalCustomers = dbCustomers || [];
      let finalServices = dbServices || [];
      let finalOffers = dbOffers || [];
      let finalReviews = dbReviews || [];

      // Merge local storage items for offline fallback demonstration
      const localBookings = JSON.parse(localStorage.getItem('ashly_local_bookings') || '[]');
      if (localBookings.length > 0) {
        const formattedLocal = localBookings.map(b => ({
          id: b.id,
          booking_date: b.booking_date,
          booking_time: b.booking_time,
          status: b.status,
          total_price: b.total_price,
          notes: b.notes,
          profiles: { name: b.customerName || 'Local Tester', email: 'local@test.com', phone: '123-456' },
          services: { name: b.serviceName || 'Premium Ritual', category: 'Haircare' }
        }));
        finalBookings = [...formattedLocal, ...finalBookings];
      }

      // Merge local storage offers for offline/sandbox fallback
      const localOffers = JSON.parse(localStorage.getItem('ashly_local_offers') || '[]');
      if (localOffers.length > 0) {
        // De-duplicate in case some are already in dbOffers
        const dbTitles = new Set(finalOffers.map(o => o.title));
        const filteredLocal = localOffers.filter(o => !dbTitles.has(o.title));
        finalOffers = [...filteredLocal, ...finalOffers];
      }

      // Populate dummy customers if none
      if (finalCustomers.length === 0) {
        finalCustomers = [
          { id: '1', name: 'Alice Smith', email: 'alice@example.com', phone: '555-1234', created_at: '2026-07-01' },
          { id: '2', name: 'Emily Davis', email: 'emily@example.com', phone: '555-5678', created_at: '2026-07-03' }
        ];
      }

      // Populate default services if none
      if (finalServices.length === 0) {
        finalServices = [
          { id: 's1', name: 'Luxury Royal Haircut', category: 'Haircut', duration_mins: 45, price: 999, discount_percent: 10 },
          { id: 's2', name: 'Gold Radiance Facial', category: 'Facial', duration_mins: 60, price: 2499, discount_percent: 15 }
        ];
      }

      // Populate dummy reviews if empty
      if (finalReviews.length === 0) {
        finalReviews = [
          { id: 'r1', rating: 5, comment: 'Phenomenal service! The scalp massage was heavenly.', profiles: { name: 'Alice Smith' }, services: { name: 'Luxury Royal Haircut' } }
        ];
      }

      setBookings(finalBookings);
      setCustomers(finalCustomers);
      setServices(finalServices);
      setOffers(finalOffers);
      setReviews(finalReviews);

    } catch (err) {
      console.error(err);
      setError('Could not fetch dashboard datasets.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      // Check if it's a local booking
      if (typeof bookingId === 'string' && bookingId.startsWith('b-')) {
        const local = JSON.parse(localStorage.getItem('ashly_local_bookings') || '[]');
        const updated = local.map(b => b.id === bookingId ? { ...b, status: newStatus } : b);
        localStorage.setItem('ashly_local_bookings', JSON.stringify(updated));
        fetchAllData();
        return;
      }

      const { error: updateErr } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId);

      if (updateErr) throw updateErr;
      fetchAllData();
    } catch (err) {
      setError('Failed to update booking status.');
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    const serviceData = {
      name: newServiceName,
      category: newServiceCategory,
      description: newServiceDesc,
      duration_mins: parseInt(newServiceDuration),
      price: parseFloat(newServicePrice),
      discount_percent: parseFloat(newServiceDiscount),
      image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'
    };

    try {
      const { error: sErr } = await supabase.from('services').insert([serviceData]);
      if (sErr) throw sErr;
      
      setNewServiceName('');
      setNewServiceDesc('');
      setNewServicePrice('');
      setNewServiceDiscount(0);
      fetchAllData();
    } catch (err) {
      // Offline fallback setup
      const localS = [...services, { id: 's-' + Date.now(), ...serviceData }];
      setServices(localS);
      setNewServiceName('');
      setNewServiceDesc('');
      setNewServicePrice('');
      setNewServiceDiscount(0);
    }
  };

  const handleAddOffer = async (e) => {
    e.preventDefault();
    const offerData = {
      title: newOfferTitle,
      description: newOfferDesc,
      discount_percent: parseFloat(newOfferDiscount),
      valid_until: newOfferValidUntil
    };

    if (editingOfferId) {
      // Update Mode
      // 1. Update in local storage
      const local = JSON.parse(localStorage.getItem('ashly_local_offers') || '[]');
      const updatedLocal = local.map(o => o.id === editingOfferId ? { ...o, ...offerData } : o);
      localStorage.setItem('ashly_local_offers', JSON.stringify(updatedLocal));

      // 2. Update in Supabase
      try {
        if (typeof editingOfferId === 'string' && !editingOfferId.startsWith('o-')) {
          const { error: upErr } = await supabase.from('offers').update(offerData).eq('id', editingOfferId);
          if (upErr) throw upErr;
        }
      } catch (err) {
        console.warn("DB update failed, operating locally");
      }

      setEditingOfferId(null);
      setNewOfferTitle('');
      setNewOfferDesc('');
      setNewOfferDiscount(10);
      setNewOfferValidUntil('');
      fetchAllData();
    } else {
      // Insert Mode
      // 1. Save to localStorage immediately
      const local = JSON.parse(localStorage.getItem('ashly_local_offers') || '[]');
      const newLocal = [{ id: 'o-' + Date.now(), ...offerData }, ...local];
      localStorage.setItem('ashly_local_offers', JSON.stringify(newLocal));

      // 2. Insert to Supabase
      try {
        const { error: oErr } = await supabase.from('offers').insert([offerData]);
        if (oErr) throw oErr;
        
        setNewOfferTitle('');
        setNewOfferDesc('');
        setNewOfferDiscount(10);
        setNewOfferValidUntil('');
        fetchAllData();
      } catch (err) {
        console.warn("DB save failed, operating in sandbox mode");
        setNewOfferTitle('');
        setNewOfferDesc('');
        setNewOfferDiscount(10);
        setNewOfferValidUntil('');
        fetchAllData();
      }
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (confirm("Are you sure you want to end/delete this promotional offer?")) {
      // 1. Delete from Supabase
      try {
        if (typeof offerId === 'string' && !offerId.startsWith('o-')) {
          const { error: delErr } = await supabase.from('offers').delete().eq('id', offerId);
          if (delErr) throw delErr;
        }
      } catch (err) {
        console.warn("DB delete failed, operating locally");
      }

      // 2. Delete from local storage
      const local = JSON.parse(localStorage.getItem('ashly_local_offers') || '[]');
      const filtered = local.filter(o => o.id !== offerId);
      localStorage.setItem('ashly_local_offers', JSON.stringify(filtered));

      // 3. Update state
      setOffers(prev => prev.filter(o => o.id !== offerId));
      fetchAllData();
    }
  };

  const handleEditOffer = (offer) => {
    setEditingOfferId(offer.id);
    setNewOfferTitle(offer.title);
    setNewOfferDesc(offer.description || '');
    setNewOfferDiscount(offer.discount_percent);
    setNewOfferValidUntil(offer.valid_until);
  };

  const handleCancelEdit = () => {
    setEditingOfferId(null);
    setNewOfferTitle('');
    setNewOfferDesc('');
    setNewOfferDiscount(10);
    setNewOfferValidUntil('');
  };

  // Analytics helper calculations
  const calculateAnalytics = () => {
    const total = bookings.length;
    const approved = bookings.filter(b => b.status === 'approved').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const revenue = bookings
      .filter(b => b.status === 'approved' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.total_price), 0);

    return { total, approved, pending, revenue: revenue.toFixed(2) };
  };

  const stats = calculateAnalytics();

  // Search bookings logic
  const filteredBookings = bookings.filter(b => {
    const custName = b.profiles?.name || '';
    const servName = b.services?.name || '';
    const query = searchQuery.toLowerCase();
    return custName.toLowerCase().includes(query) || servName.toLowerCase().includes(query) || b.status.toLowerCase().includes(query);
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved':
        return { backgroundColor: '#eefcf3', color: '#2d7a43' };
      case 'cancelled':
        return { backgroundColor: '#fff5f5', color: '#cf7c7c' };
      case 'completed':
        return { backgroundColor: '#f0f7ff', color: '#1e40af' };
      default:
        return { backgroundColor: '#fffdf5', color: '#b45309' };
    }
  };

  return (
    <div style={styles.page}>
      <div className="container" style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Admin Salon Panel</h1>
          <p style={styles.subtitle}>Supervise daily bookings, register offers, manage styling menus, and view reviews.</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Analytics Section */}
        <section style={styles.analyticsGrid}>
          <div className="premium-card" style={styles.statCard}>
            <Calendar size={24} color="var(--primary)" />
            <div>
              <span style={styles.statLabel}>Total Bookings</span>
              <h2 style={styles.statValue}>{stats.total}</h2>
            </div>
          </div>
          <div className="premium-card" style={styles.statCard}>
            <CheckCircle2 size={24} color="var(--success)" />
            <div>
              <span style={styles.statLabel}>Approved Requests</span>
              <h2 style={styles.statValue}>{stats.approved}</h2>
            </div>
          </div>
          <div className="premium-card" style={styles.statCard}>
            <AlertCircle size={24} color="var(--accent)" />
            <div>
              <span style={styles.statLabel}>Pending Verification</span>
              <h2 style={styles.statValue}>{stats.pending}</h2>
            </div>
          </div>
          <div className="premium-card" style={styles.statCard}>
            <IndianRupee size={24} color="var(--success)" />
            <div>
              <span style={styles.statLabel}>Total Earnings</span>
              <h2 style={styles.statValue}>₹{stats.revenue}</h2>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div style={styles.tabBar}>
          {['bookings', 'customers', 'services', 'offers', 'reviews'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.activeTabBtn : {})
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div style={styles.content}>
          {activeTab === 'bookings' && (
            <div style={styles.tabPane} className="animate-fade-in">
              <div style={styles.searchBarWrapper}>
                <Search size={18} style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search bookings by customer name, service or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>

              <div style={styles.tableCard} className="premium-card">
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Service</th>
                      <th style={styles.th}>Timing</th>
                      <th style={styles.th}>Price</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id} style={styles.tableRow}>
                        <td style={styles.td}>
                          <strong style={{ display: 'block' }}>{b.profiles?.name || 'Guest'}</strong>
                          <span style={styles.smallText}>{b.profiles?.email} | {b.profiles?.phone}</span>
                        </td>
                        <td style={styles.td}>{b.services?.name}</td>
                        <td style={styles.td}>{b.booking_date} @ {b.booking_time}</td>
                        <td style={styles.td}>₹{parseFloat(b.total_price).toFixed(2)}</td>
                        <td style={styles.td}>
                          <span style={{ ...styles.statusBadge, ...getStatusStyle(b.status) }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionGroup}>
                            {b.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'approved')}
                                style={styles.approveBtn}
                              >
                                Approve
                              </button>
                            )}
                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'cancelled')}
                                style={styles.cancelBtn}
                              >
                                Cancel
                              </button>
                            )}
                            {b.status === 'approved' && (
                              <button
                                onClick={() => handleUpdateStatus(b.id, 'completed')}
                                style={styles.completeBtn}
                              >
                                Complete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div style={styles.tabPane} className="animate-fade-in">
              <div style={styles.tableCard} className="premium-card">
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeaderRow}>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email Address</th>
                      <th style={styles.th}>Phone Number</th>
                      <th style={styles.th}>Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(c => (
                      <tr key={c.id} style={styles.tableRow}>
                        <td style={styles.td}><strong>{c.name}</strong></td>
                        <td style={styles.td}>{c.email}</td>
                        <td style={styles.td}>{c.phone || 'N/A'}</td>
                        <td style={styles.td}>{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="admin-services-grid animate-fade-in">
              {/* Add Service form */}
              <div style={styles.formCard} className="premium-card">
                <h3 style={styles.formTitle}><PlusCircle size={18} /> Add New Service</h3>
                <form onSubmit={handleAddService} style={styles.form}>
                  <div style={styles.formRow}>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Service Name</label>
                      <input
                        type="text"
                        required
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        placeholder="e.g. Keratin Smooth Therapy"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Category</label>
                      <select
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value)}
                        style={styles.select}
                      >
                        <option value="Haircut">Haircut</option>
                        <option value="Hair Styling">Hair Styling</option>
                        <option value="Hair Spa">Hair Spa</option>
                        <option value="Hair Coloring">Hair Coloring</option>
                        <option value="Hair Smoothening">Hair Smoothening</option>
                        <option value="Keratin Treatment">Keratin Treatment</option>
                        <option value="Facial">Facial</option>
                        <option value="Cleanup">Cleanup</option>
                        <option value="Detan">Detan</option>
                        <option value="Bleach">Bleach</option>
                        <option value="Waxing">Waxing</option>
                        <option value="Threading">Threading</option>
                        <option value="Manicure">Manicure</option>
                        <option value="Pedicure">Pedicure</option>
                        <option value="Nail Art">Nail Art</option>
                        <option value="Skin Care">Skin Care</option>
                        <option value="Body Polishing">Body Polishing</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Duration (minutes)</label>
                      <input
                        type="number"
                        required
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Price (₹)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        placeholder="999.00"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Discount (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newServiceDiscount}
                        onChange={(e) => setNewServiceDiscount(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputCol}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={newServiceDesc}
                      onChange={(e) => setNewServiceDesc(e.target.value)}
                      placeholder="Service descriptions help customers understand details..."
                      rows={3}
                      style={styles.textarea}
                    />
                  </div>

                  <button type="submit" className="btn-primary">Add Service</button>
                </form>
              </div>

              {/* Service Catalog List */}
              <div style={styles.listCard} className="premium-card">
                <h3 style={styles.formTitle}><ShoppingBag size={18} /> Current Catalog</h3>
                <div style={styles.serviceCatalogList}>
                  {services.map(s => (
                    <div key={s.id} style={styles.catalogItem}>
                      <div>
                        <strong>{s.name}</strong>
                        <div style={styles.catalogItemSub}>
                          <span>{s.category}</span> • <span>{s.duration_mins} mins</span> • <span>₹{parseFloat(s.price).toFixed(2)}</span>
                          {s.discount_percent > 0 && <span style={styles.discountText}> ({s.discount_percent}% off)</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="admin-services-grid animate-fade-in">
              <div style={styles.formCard} className="premium-card">
                <h3 style={styles.formTitle}>
                  <PlusCircle size={18} /> {editingOfferId ? 'Edit Promotional Offer' : 'Create Promotional Offer'}
                </h3>
                <form onSubmit={handleAddOffer} style={styles.form}>
                  <div style={styles.formRow}>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Promo Title</label>
                      <input
                        type="text"
                        required
                        value={newOfferTitle}
                        onChange={(e) => setNewOfferTitle(e.target.value)}
                        placeholder="e.g. Wedding Pamper Discount"
                        style={styles.input}
                      />
                    </div>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Discount (%)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="100"
                        value={newOfferDiscount}
                        onChange={(e) => setNewOfferDiscount(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow}>
                    <div style={styles.inputCol}>
                      <label style={styles.label}>Valid Until Date</label>
                      <input
                        type="date"
                        required
                        value={newOfferValidUntil}
                        onChange={(e) => setNewOfferValidUntil(e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.inputCol}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={newOfferDesc}
                      onChange={(e) => setNewOfferDesc(e.target.value)}
                      placeholder="Add key terms & guidelines..."
                      rows={3}
                      style={styles.textarea}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                      {editingOfferId ? 'Update Promo Offer' : 'Launch Promo Offer'}
                    </button>
                    {editingOfferId && (
                      <button 
                        type="button" 
                        onClick={handleCancelEdit}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          padding: '0.75rem 1rem',
                          fontFamily: 'inherit',
                          fontSize: '0.875rem'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div style={styles.listCard} className="premium-card">
                <h3 style={styles.formTitle}><ShoppingBag size={18} /> Active Promos</h3>
                <div style={styles.serviceCatalogList}>
                  {offers.map(o => (
                    <div key={o.id} style={{ ...styles.catalogItem, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, paddingRight: '1rem' }}>
                        <strong>{o.title}</strong>
                        <p style={styles.catalogItemSub}>{o.description}</p>
                        <div style={styles.catalogItemSub}>
                          <span>{o.discount_percent}% OFF</span> • <span>Until: {o.valid_until}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleEditOffer(o)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#c5a880',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Edit Offer"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteOffer(o.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#d4838f',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete Offer"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {offers.length === 0 && <p style={styles.smallText}>No promotional offers active.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div style={styles.tabPane} className="animate-fade-in">
              <div style={styles.reviewsGrid}>
                {reviews.map(r => (
                  <div key={r.id} className="premium-card" style={styles.reviewCard}>
                    <div style={styles.reviewHeader}>
                      <strong>{r.profiles?.name || 'Anonymous Customer'}</strong>
                      <div style={styles.ratingStars}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            fill={i < r.rating ? 'var(--accent)' : 'none'}
                            color="var(--accent)"
                          />
                        ))}
                      </div>
                    </div>
                    <span style={styles.reviewService}>Treatment: {r.services?.name || 'General Treatment'}</span>
                    <p style={styles.reviewComment}>"{r.comment || 'No written comments.'}"</p>
                  </div>
                ))}
                {reviews.length === 0 && <p style={styles.smallText}>No client reviews submitted yet.</p>}
              </div>
            </div>
          )}
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
  header: {
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
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    padding: '1.5rem',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  statLabel: {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: 'var(--text-dark)',
  },
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
    overflowX: 'auto',
  },
  tabBtn: {
    padding: '0.6rem 1.25rem',
    background: 'none',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-sm)',
    transition: 'var(--transition)',
  },
  activeTabBtn: {
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
  },
  content: {
    marginTop: '0.5rem',
  },
  searchBarWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    color: 'var(--text-muted)',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.95rem',
    backgroundColor: 'var(--secondary)',
    outline: 'none',
  },
  tableCard: {
    backgroundColor: 'var(--secondary)',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '2px solid var(--border-color)',
    backgroundColor: '#fffcf9',
  },
  th: {
    padding: '1rem 1.5rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
  },
  tableRow: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'var(--transition)',
    '&:hover': {
      backgroundColor: '#fdfbf7',
    }
  },
  td: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.95rem',
  },
  smallText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'uppercase',
  },
  actionGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  approveBtn: {
    backgroundColor: 'var(--success)',
    color: 'var(--secondary)',
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelBtn: {
    backgroundColor: 'var(--danger)',
    color: 'var(--secondary)',
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  completeBtn: {
    backgroundColor: 'var(--primary)',
    color: 'var(--secondary)',
    border: 'none',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  formCard: {
    padding: '2rem',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formTitle: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-heading)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '0.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  inputCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    minWidth: '150px',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  input: {
    padding: '0.75rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-beige)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  select: {
    padding: '0.75rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-beige)',
    fontSize: '0.95rem',
    outline: 'none',
  },
  textarea: {
    padding: '0.75rem',
    border: '1.5px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--bg-beige)',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
  },
  listCard: {
    padding: '2rem',
    backgroundColor: 'var(--secondary)',
  },
  serviceCatalogList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginTop: '1rem',
  },
  catalogItem: {
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catalogItemSub: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '0.25rem',
  },
  discountText: {
    color: 'var(--danger)',
    fontWeight: '700',
  },
  reviewsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  reviewCard: {
    padding: '1.5rem',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingStars: {
    display: 'flex',
    gap: '2px',
  },
  reviewService: {
    fontSize: '0.8rem',
    color: 'var(--accent)',
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    border: '1px solid #ffc9c9',
    color: 'var(--danger)',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
};

export default AdminDashboard;
