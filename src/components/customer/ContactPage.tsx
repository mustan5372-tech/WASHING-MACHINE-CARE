import React from 'react';
import type { BusinessSettings } from '../../types';
import { Phone, Clock, MapPin, Send } from 'lucide-react';

interface ContactPageProps {
  settings: BusinessSettings;
  onNavigate: (tab: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const primaryPhone = "+91 9926064529";
  const secondaryPhone = "+91 9826247802";

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
          Contact Washing Machine Care
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          We're here to assist you with door-step repairs, service scheduling, and spare parts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }} className="contact-grid">
        
        {/* Direct Contact Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Primary Helpline Card */}
          <div className="card" style={{ borderLeft: '4px solid #1d4ed8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} style={{ color: '#1d4ed8' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>HELPLINE 1 (PRIMARY)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{primaryPhone}</div>
              </div>
            </div>
            <a href={`tel:${primaryPhone.replace(/\s+/g, '')}`} className="btn btn-primary btn-block btn-sm" style={{ marginTop: '0.75rem' }}>
              <Phone size={16} /> Call {primaryPhone}
            </a>
          </div>

          {/* Secondary Helpline Card */}
          <div className="card" style={{ borderLeft: '4px solid #059669' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Phone size={20} style={{ color: '#059669' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>HELPLINE 2 (SECONDARY)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{secondaryPhone}</div>
              </div>
            </div>
            <a href={`tel:${secondaryPhone.replace(/\s+/g, '')}`} className="btn btn-success btn-block btn-sm" style={{ marginTop: '0.75rem' }}>
              <Phone size={16} /> Call {secondaryPhone}
            </a>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
              <Clock size={22} style={{ color: '#d97706', marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Working Hours</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569' }}>{settings.workingHours}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <MapPin size={22} style={{ color: '#dc2626', marginTop: '2px' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>Main Service Workshop</h3>
                <p style={{ fontSize: '0.9rem', color: '#475569' }}>{settings.address}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Message Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
            Send Us a Quick Message
          </h3>

          <form onSubmit={(e) => {
            e.preventDefault();
            alert('Thank you! Your message has been submitted. Our support team will call you shortly.');
          }}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input type="text" required placeholder="Enter your full name" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="tel" required placeholder="10-digit mobile number" className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Message / Inquiry</label>
              <textarea rows={4} required placeholder="Ask about spare parts, service charges, or warranty..." className="form-textarea" />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              <Send size={18} /> Submit Inquiry
            </button>
          </form>
        </div>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
