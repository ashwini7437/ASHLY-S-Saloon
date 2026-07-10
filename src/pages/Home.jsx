import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Sparkles, Scissors, Heart, Gift, Award, Calendar, Percent, Clock } from 'lucide-react';

const CATEGORIES = [
  { name: 'Haircut', icon: '💇‍♀️' },
  { name: 'Hair Styling', icon: '💁‍♀️' },
  { name: 'Hair Spa', icon: '💆‍♀️' },
  { name: 'Hair Coloring', icon: '🎨' },
  { name: 'Hair Smoothening', icon: '✨' },
  { name: 'Keratin Treatment', icon: '👑' },
  { name: 'Facial', icon: '🧴' },
  { name: 'Cleanup', icon: '🧼' },
  { name: 'Detan', icon: '☀️' },
  { name: 'Bleach', icon: '🧪' },
  { name: 'Waxing', icon: '🪒' },
  { name: 'Threading', icon: '🧵' },
  { name: 'Manicure', icon: '💅' },
  { name: 'Pedicure', icon: '👣' },
  { name: 'Nail Art', icon: '🌟' },
  { name: 'Skin Care', icon: '🌹' },
  { name: 'Body Polishing', icon: '💎' }
];

// Fallback services in case database is empty or not configured yet
const DEFAULT_SERVICES = [
  {
    id: 's1',
    name: 'Luxury Royal Haircut',
    category: 'Haircut',
    description: 'A premium haircut tailored to your face structure, including luxury hair washing and custom blow-dry.',
    duration_mins: 45,
    price: 999.00,
    discount_percent: 10,
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 's2',
    name: 'Gold Radiance Facial',
    category: 'Facial',
    description: 'Enriched with 24k gold extracts to bring out instant radiance, skin rejuvenation, and collagen boost.',
    duration_mins: 60,
    price: 2499.00,
    discount_percent: 15,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 's3',
    name: 'Bridal Nail Art & Gel Polish',
    category: 'Nail Art',
    description: 'Exquisite nail art customized to your style with premium long-lasting UV gel coat.',
    duration_mins: 50,
    price: 1999.00,
    discount_percent: 0,
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 's4',
    name: 'Moroccan Hair Spa',
    category: 'Hair Spa',
    description: 'Intense hydration and deep conditioning treatment using authentic organic argan oil.',
    duration_mins: 60,
    price: 1799.00,
    discount_percent: 20,
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 's5',
    name: 'Premium Keratin Complex',
    category: 'Keratin Treatment',
    description: 'Eliminate frizz and introduce silky smooth straight hair with our botanical-infused keratin complex.',
    duration_mins: 120,
    price: 4999.00,
    discount_percent: 15,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 's6',
    name: 'Luxe Body Polishing',
    category: 'Body Polishing',
    description: 'Complete body exfoliation with walnut micro-beads followed by a luxury cream massage and hydration wrap.',
    duration_mins: 90,
    price: 3499.00,
    discount_percent: 10,
    image_url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=600&q=80'
  }
];

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [offers, setOffers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServicesAndOffers();
  }, []);

  const fetchServicesAndOffers = async () => {
    try {
      const { data: dbServices, error: sErr } = await supabase.from('services').select('*');
      if (!sErr && dbServices && dbServices.length > 0) {
        setServices(dbServices);
      }
      
      const { data: dbOffers, error: oErr } = await supabase.from('offers').select('*').gte('valid_until', new Date().toISOString().split('T')[0]);
      if (!oErr && dbOffers) {
        setOffers(dbOffers);
      }
    } catch (err) {
      console.warn("Could not load database records, using local fallback services.", err);
    }
  };

  const filteredServices = selectedCategory === 'All' 
    ? services 
    : services.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div className="container hero-container-grid">
          <div className="hero-content-flex animate-fade-in">
            <div style={styles.tagline}>
              <Sparkles size={16} color="var(--accent)" />
              <span>THE ULTIMATE BEAUTY EXPERIENCE</span>
            </div>
            <h1 style={styles.heroTitle}>Elegance & luxury, customized for you</h1>
            <p style={styles.heroSub}>
              Immerse yourself in premium self-care with our bespoke styling, hair therapies, and skin renewal sessions.
            </p>
            <button onClick={() => navigate('/booking')} className="btn-primary">
              <Calendar size={18} /> Book Your Appointment
            </button>
          </div>
          <div style={styles.heroImageContainer}>
            <div style={styles.heroImageDecoration}></div>
            <img 
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80" 
              alt="Luxury Salon Spa Session" 
              style={styles.heroImage}
            />
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      {offers.length > 0 && (
        <section style={styles.offersSection}>
          <div className="container">
            <h2 style={styles.sectionTitle}>Exclusive Seasonal Offers</h2>
            <div style={styles.offersGrid}>
              {offers.map(offer => (
                <div key={offer.id} className="premium-card" style={styles.offerCard}>
                  <div style={styles.offerBadge}>
                    <Percent size={14} /> {parseFloat(offer.discount_percent)}% OFF
                  </div>
                  <h3 style={styles.offerTitle}>{offer.title}</h3>
                  <p style={styles.offerDesc}>{offer.description}</p>
                  <span style={styles.offerDate}>Valid until: {offer.valid_until}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section style={styles.categoriesSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Browse Our Curated Categories</h2>
            <p style={styles.sectionSub}>Select a category to view the specialized treatments available</p>
          </div>
          <div style={styles.categoriesContainer}>
            <button 
              onClick={() => setSelectedCategory('All')}
              style={{
                ...styles.categoryBtn,
                ...(selectedCategory === 'All' ? styles.activeCategoryBtn : {})
              }}
            >
              <span>🌸</span>
              <span style={styles.categoryName}>All Services</span>
            </button>
            {CATEGORIES.map(cat => (
              <button 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                style={{
                  ...styles.categoryBtn,
                  ...(selectedCategory === cat.name ? styles.activeCategoryBtn : {})
                }}
              >
                <span style={styles.categoryIcon}>{cat.icon}</span>
                <span style={styles.categoryName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section style={styles.servicesSection}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Our Premium Rituals</h2>
            <p style={styles.sectionSub}>Handcrafted pampering treatments to refresh, restore, and inspire</p>
          </div>

          {filteredServices.length === 0 ? (
            <div style={styles.noServices}>
              <p>No services found in this category. Select another category or check back later!</p>
            </div>
          ) : (
            <div style={styles.servicesGrid}>
              {filteredServices.map(service => {
                const discountedPrice = service.discount_percent > 0 
                  ? (service.price * (1 - service.discount_percent / 100)).toFixed(2)
                  : parseFloat(service.price).toFixed(2);

                return (
                  <div key={service.id} className="premium-card" style={styles.serviceCard}>
                    <div style={styles.serviceImgContainer}>
                      <img 
                        src={service.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'} 
                        alt={service.name} 
                        style={styles.serviceImg}
                      />
                      {service.discount_percent > 0 && (
                        <div style={styles.discountBadge}>
                          {parseFloat(service.discount_percent)}% OFF
                        </div>
                      )}
                    </div>
                    <div style={styles.serviceInfo}>
                      <div style={styles.serviceCategoryBadge}>{service.category}</div>
                      <h3 style={styles.serviceName}>{service.name}</h3>
                      <p style={styles.serviceDesc}>{service.description}</p>
                      
                      <div style={styles.serviceMeta}>
                        <div style={styles.metaItem}>
                          <Clock size={16} color="var(--accent)" />
                          <span>{service.duration_mins} mins</span>
                        </div>
                        <div style={styles.priceContainer}>
                          {service.discount_percent > 0 && (
                            <span style={styles.oldPrice}>₹{parseFloat(service.price).toFixed(2)}</span>
                          )}
                          <span style={styles.currentPrice}>₹{discountedPrice}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => navigate('/booking', { state: { preselectedService: service } })} 
                        style={styles.bookNowBtn}
                      >
                        Book Ritual
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4rem',
    paddingBottom: '5rem',
  },
  hero: {
    padding: '3rem 0',
    backgroundColor: '#fffcf7',
    borderBottom: '1px solid var(--border-color)',
    position: 'relative',
    overflow: 'hidden',
  },
  tagline: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '1.5px',
    color: 'var(--accent)',
  },
  heroTitle: {
    fontSize: '3rem',
    lineHeight: '1.2',
    color: 'var(--text-dark)',
  },
  heroSub: {
    fontSize: '1.1rem',
    color: 'var(--text-muted)',
    maxWidth: '540px',
  },
  heroImageContainer: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  heroImageDecoration: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    width: '100%',
    height: '100%',
    border: '2px solid var(--accent)',
    borderRadius: 'var(--radius-lg)',
    zIndex: 1,
  },
  heroImage: {
    width: '100%',
    maxHeight: '450px',
    objectFit: 'cover',
    borderRadius: 'var(--radius-lg)',
    position: 'relative',
    zIndex: 2,
    boxShadow: 'var(--shadow-lg)',
  },
  offersSection: {
    padding: '2rem 0',
  },
  offersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginTop: '1.5rem',
  },
  offerCard: {
    padding: '2rem',
    background: 'linear-gradient(135deg, #ffffff 0%, #fdf5f6 100%)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  offerBadge: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '0.35rem 0.75rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  offerTitle: {
    fontSize: '1.25rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-dark)',
  },
  offerDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
  },
  offerDate: {
    fontSize: '0.8rem',
    color: 'var(--accent)',
    fontWeight: '600',
  },
  categoriesSection: {
    padding: '2rem 0 0 0',
  },
  categoriesContainer: {
    display: 'flex',
    gap: '1rem',
    overflowX: 'auto',
    padding: '1rem 0.5rem',
    scrollSnapType: 'x mandatory',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
  },
  categoryBtn: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1.2rem 1.5rem',
    backgroundColor: 'var(--secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'var(--transition)',
    minWidth: '120px',
  },
  activeCategoryBtn: {
    backgroundColor: 'var(--primary-light)',
    borderColor: 'var(--primary)',
    color: 'var(--primary)',
    boxShadow: 'var(--shadow-sm)',
  },
  categoryIcon: {
    fontSize: '1.75rem',
  },
  categoryName: {
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  servicesSection: {
    padding: '2rem 0',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sectionTitle: {
    fontSize: '2.25rem',
    color: 'var(--text-dark)',
  },
  sectionSub: {
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '2rem',
  },
  serviceCard: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  serviceImgContainer: {
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
  },
  serviceImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'var(--transition)',
  },
  discountBadge: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    backgroundColor: 'var(--danger)',
    color: 'var(--secondary)',
    padding: '0.25rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
  serviceInfo: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    gap: '0.75rem',
  },
  serviceCategoryBadge: {
    alignSelf: 'flex-start',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: 'var(--accent)',
    fontWeight: '700',
  },
  serviceName: {
    fontSize: '1.3rem',
    color: 'var(--text-dark)',
  },
  serviceDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    flexGrow: 1,
  },
  serviceMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.5rem',
    padding: '0.75rem 0',
    borderTop: '1px solid rgba(0,0,0,0.03)',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
  },
  oldPrice: {
    fontSize: '0.85rem',
    textDecoration: 'line-through',
    color: 'var(--text-muted)',
  },
  currentPrice: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-dark)',
  },
  bookNowBtn: {
    backgroundColor: 'var(--secondary)',
    border: '1.5px solid var(--primary)',
    color: 'var(--primary)',
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition)',
    marginTop: '0.5rem',
  },
  noServices: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: 'var(--text-muted)',
  },
};

// Make sure responsive grid displays nicely on mobile
const injectHomeStyles = () => {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @media (max-width: 992px) {
      div[style*="heroContainer"] {
        grid-template-columns: 1fr !important;
        text-align: center;
      }
      div[style*="heroContent"] {
        align-items: center !important;
      }
    }
  `;
  document.head.appendChild(styleTag);
};
if (typeof window !== 'undefined') {
  injectHomeStyles();
}

export default Home;
