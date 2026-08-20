import React from 'react';
import type { BusinessSettings } from '../../types';
import { Phone, Clock, MapPin, Shield, CheckCircle, Code, ExternalLink, Sparkles } from 'lucide-react';

interface FooterProps {
  settings: BusinessSettings;
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const primaryPhone = "+91 9926064529";
  const secondaryPhone = "+91 9826247802";

  return (
    <footer style={{ backgroundColor: '#0f172a', color: '#f8fafc', paddingTop: '3.5rem', paddingBottom: '2.5rem', borderTop: '1px solid #1e293b' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Brand Info with Logo */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img 
                src="/logo.png" 
                alt="Washing Machine Care Logo" 
                style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
              />
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                {settings.businessName}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.925rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              Professional home door-step repair & servicing for all washing machine brands. Fast, transparent & guaranteed 30-day service warranty.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>
              <CheckCircle size={16} /> Certified Technicians
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
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
                <button onClick={() => onNavigate('admin-dashboard')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
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
                <a href={`tel:${secondaryPhone.replace(/\s+/g, '')}`} style={{ color: '#22c55e', fontWeight: 700, textDecoration: 'none' }}>
                  {secondaryPhone}
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

        {/* Catchy & Premium Website Developer Banner */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '20px', 
            padding: '1.75rem 2rem', 
            marginBottom: '2.5rem',
            border: '1px solid #334155',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  padding: '3px',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                  boxShadow: '0 0 25px rgba(59, 130, 246, 0.6)'
                }}
              >
                <img 
                  src="/profile.jpg" 
                  alt="Mustansir Murtaza Sanawadwala" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    border: '2px solid #0f172a'
                  }}
                />
              </div>
              <div style={{ position: 'absolute', bottom: '2px', right: '2px', backgroundColor: '#2563eb', color: '#ffffff', padding: '5px', borderRadius: '50%', border: '2px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} />
              </div>
            </div>

            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '0.4rem' }}>
                <Code size={13} /> Lead Full-Stack Web Developer
              </div>
              
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.01em' }}>
                Mustansir Murtaza Sanawadwala
              </h3>

              <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                Designed & Built with modern web performance, real-time Firebase & cloud hosting.
              </p>
            </div>
          </div>

          {/* Portfolio Website Link Button */}
          <a 
            href="https://mustansir.vercel.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              backgroundColor: '#2563eb', 
              color: '#ffffff', 
              fontWeight: 800, 
              fontSize: '0.95rem',
              padding: '0.75rem 1.4rem', 
              borderRadius: '12px', 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)',
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
          >
            Visit Developer Portfolio <ExternalLink size={16} />
          </a>
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
