import React from 'react';
import { Sparkles, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.grid}>
        <div style={styles.about}>
          <div style={styles.logo}>
            <Sparkles size={20} color="var(--accent)" />
            <span style={styles.logoText}>ASHLY'S <span style={styles.logoSub}>Saloon</span></span>
          </div>
          <p style={styles.description}>
            Exquisite hair care, skin revitalization, and elegant styling designed specifically for the modern woman. Experience premium luxury.
          </p>
        </div>

        <div style={styles.infoCol}>
          <h4 style={styles.heading}>Services</h4>
          <ul style={styles.list}>
            <li>Hair Styling & Spa</li>
            <li>Facial & Skin Care</li>
            <li>Nail Art & Polishing</li>
            <li>Waxing & Detan</li>
          </ul>
        </div>

        <div style={styles.infoCol}>
          <h4 style={styles.heading}>Contact Details</h4>
          <ul style={styles.list}>
            <li style={styles.iconListItem}><Phone size={16} color="var(--accent)" /> +91 98765 43210</li>
            <li style={styles.iconListItem}><Mail size={16} color="var(--accent)" /> contact@ashlysaloon.com</li>
            <li style={styles.iconListItem}><MapPin size={16} color="var(--accent)" /> Aundh, Pune</li>
          </ul>
        </div>
      </div>
      <div style={styles.bottomBar}>
        <p>© {new Date().getFullYear()} ASHLY's Saloon. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: 'var(--text-dark)',
    color: '#ebdcd6',
    padding: '4rem 0 2rem 0',
    marginTop: 'auto',
    borderTop: '2px solid var(--accent)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2.5rem',
  },
  about: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoText: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.3rem',
    fontWeight: '700',
    color: 'var(--secondary)',
    letterSpacing: '1px',
  },
  logoSub: {
    color: 'var(--primary)',
    fontWeight: '400',
    fontStyle: 'italic',
  },
  description: {
    fontSize: '0.9rem',
    color: '#b3aca7',
    lineHeight: '1.6',
  },
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.2rem',
  },
  heading: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.1rem',
    color: 'var(--accent)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '0.5rem',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    fontSize: '0.9rem',
    color: '#b3aca7',
  },
  iconListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  bottomBar: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    marginTop: '3rem',
    paddingTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#7e7874',
  },
};

export default Footer;
