import React from 'react';
import type { BusinessSettings } from '../../types';
import { Phone, Clock, MapPin, Shield, CheckCircle } from 'lucide-react';

interface FooterProps {
  settings: BusinessSettings;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const primaryPhone = "+91 9826247802";

  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#f8fafc', paddingTop: '3rem', paddingBottom: '2rem', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          
          {/* Brand Info with Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img 
                src="/logo.png" 
                alt="Washing Machine Care Logo" 
                style={{ height: '38px', width: 'auto', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                {settings.businessName}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              Professional home door-step repair & servicing for all washing machine brands. Fast, transparent & guaranteed 30-day service warranty.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>
              <CheckCircle size={16} /> Certified Technicians
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li>
                <button onClick={() => onNavigate('book-repair')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}>
                  🔧 Book a Repair Request
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track-complaint')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}>
                  🔍 Track My Complaint
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: 0 }}>
                  📞 Customer Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-dashboard')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Shield size={14} /> Shop Owner / Admin Login
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Call Helplines</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} style={{ color: '#60a5fa' }} />
                <a href={`tel:${primaryPhone.replace(/\s+/g, '')}`} style={{ color: '#ffffff', fontWeight: 700, textDecoration: 'none' }}>
                  {primaryPhone}
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} style={{ color: '#22c55e' }} />
                <a href={`tel:${primaryPhone.replace(/\s+/g, '')}`} style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
                  Direct Helpline 2
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <Clock size={16} style={{ color: '#f59e0b', marginTop: '2px' }} />
                <span>{settings.workingHours}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MapPin size={16} style={{ color: '#ef4444', marginTop: '2px' }} />
                <span>{settings.address}</span>
              </div>
            </div>
          </div>

        </div>

        <div style={{ borderTop: '1px solid #1e293b', paddingTop: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
          <div>
            © {new Date().getFullYear()} Washing Machine Care ({settings.domain}). All rights reserved.
          </div>
          <div>
            Designed for clear, fast & dependable washing machine repair service management.
          </div>
        </div>
      </div>
    </footer>
  );
};
