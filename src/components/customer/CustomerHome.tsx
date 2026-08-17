import React from 'react';
import type { BusinessSettings } from '../../types';
import { 
  Wrench, ShieldCheck, Clock, Phone, Search, 
  ArrowRight, Award, ThumbsUp, Zap 
} from 'lucide-react';

interface CustomerHomeProps {
  settings: BusinessSettings;
  onNavigate: (tab: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onNavigate }) => {
  const brands = ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Haier', 'Godrej', 'Panasonic', 'Videocon'];

  const problems = [
    { name: 'Not Starting', desc: 'Power light on or machine completely dead' },
    { name: 'Not Draining Water', desc: 'Water stays inside drum after wash' },
    { name: 'Making Noise', desc: 'Loud rattling or grinding sound during spin' },
    { name: 'Not Spinning', desc: 'Drum does not spin or dry clothes' },
    { name: 'Water Leakage', desc: 'Water leaking from bottom or door seal' },
    { name: 'Error Code', desc: 'Display panel showing error code (OE, 4E, etc.)' }
  ];

  const primaryPhone = "+91 9926064529";
  const secondaryPhone = "+91 9826247802";

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Hero Section */}
      <section 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '20px', 
          padding: '2.5rem 1.5rem', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(29, 78, 216, 0.06)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'center'
        }}
        className="hero-grid"
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', border: '1px solid #bfdbfe' }}>
            <Zap size={15} /> #1 Doorstep Washing Machine Service
          </div>
          
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Washing Machine Repair <span style={{ color: '#1d4ed8' }}>Made Easy</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#475569', marginBottom: '2rem', lineHeight: 1.6 }}>
            Book a repair service at your home in just a few steps. Fast turnaround, transparent pricing, and 30-day service warranty.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => onNavigate('book-repair')}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '200px' }}
            >
              <Wrench size={20} /> Book a Repair
            </button>

            <button 
              onClick={() => onNavigate('track-complaint')}
              className="btn btn-secondary btn-lg"
            >
              <Search size={20} /> Track My Complaint
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={18} style={{ color: '#059669' }} /> 30-Day Warranty
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={18} style={{ color: '#d97706' }} /> Same Day Slots
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={18} style={{ color: '#2563eb' }} /> Verified Techs
            </div>
          </div>
        </div>

        {/* Direct Call Helplines Card */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '380px', 
              backgroundColor: '#ffffff', 
              borderRadius: '24px', 
              padding: '2rem 1.5rem', 
              border: '2px solid #e2e8f0',
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.08)', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.25rem'
            }}
          >
            <div style={{ padding: '0.5rem', borderRadius: '16px', backgroundColor: '#eff6ff' }}>
              <img 
                src="/logo.png" 
                alt="Washing Machine Care Logo" 
                style={{ width: '140px', height: 'auto', objectFit: 'contain' }}
              />
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
                Need Immediate Help?
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: 0 }}>
                Call our repair technicians directly for instant assistance
              </p>
            </div>

            {/* Direct Calling Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%' }}>
              <a 
                href={`tel:${primaryPhone.replace(/\s+/g, '')}`}
                className="btn btn-success btn-block btn-lg"
                style={{ borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Phone size={18} /> Call {primaryPhone}
              </a>

              <a 
                href={`tel:${secondaryPhone.replace(/\s+/g, '')}`}
                className="btn btn-secondary btn-block"
                style={{ borderRadius: '12px', fontWeight: 700, backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Phone size={16} style={{ color: '#2563eb' }} /> Call {secondaryPhone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Card Banner */}
      <div 
        onClick={() => onNavigate('book-repair')}
        style={{ 
          backgroundColor: '#1d4ed8', 
          color: '#ffffff', 
          borderRadius: '16px', 
          padding: '1.5rem 2rem', 
          display: 'flex', 
          flexWrap: 'wrap', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: '1rem',
          cursor: 'pointer',
          boxShadow: '0 10px 25px -5px rgba(29, 78, 216, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wrench size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.2rem' }}>
              🔧 Ready to Book a Repair Service?
            </h2>
            <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>
              No complex forms. Select your machine, choose your problem, and pick a time slot in 2 minutes!
            </p>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ backgroundColor: '#ffffff', color: '#1d4ed8', fontWeight: 800, borderRadius: '10px' }}>
          Book Now <ArrowRight size={18} />
        </button>
      </div>

      {/* Common Problems Grid */}
      <div>
        <div style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
          Expert Diagnostics
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
          Common Washing Machine Issues We Fix
        </h2>

        <div className="grid-3">
          {problems.map((p, idx) => (
            <div 
              key={idx} 
              onClick={() => onNavigate('book-repair')}
              className="card"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out', border: '1px solid #e2e8f0' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Wrench size={18} style={{ color: '#1d4ed8' }} />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Brands We Repair */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '2rem', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', textAlign: 'center' }}>
          We Service & Repair All Major Brands
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          {brands.map(brand => (
            <div 
              key={brand} 
              style={{ 
                padding: '0.6rem 1.25rem', 
                backgroundColor: '#f8fafc', 
                border: '1px solid #cbd5e1', 
                borderRadius: '10px', 
                fontSize: '0.95rem', 
                fontWeight: 700, 
                color: '#334155' 
              }}
            >
              {brand}
            </div>
          ))}
          <div style={{ padding: '0.6rem 1.25rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', fontSize: '0.95rem', fontWeight: 700, color: '#1d4ed8' }}>
            + All Other Brands
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
          <ShieldCheck size={36} style={{ color: '#059669', marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>30-Day Warranty</h4>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Complete peace of mind. Free re-inspection if issue recurs within 30 days.</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
          <ThumbsUp size={36} style={{ color: '#1d4ed8', marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Genuine Spare Parts</h4>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>100% original manufacturer spare parts used for all repairs.</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
          <Clock size={36} style={{ color: '#d97706', marginBottom: '0.75rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Flexible Schedule</h4>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Choose your convenient visit date and time slot at home.</p>
        </div>
      </div>

      {/* CSS Layout Helper */}
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
