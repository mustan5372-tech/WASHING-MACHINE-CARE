import React from 'react';
import type { BusinessSettings } from '../../types';
import { 
  Wrench, Search, ShieldCheck, Clock, Award, Phone, Zap, 
  ArrowRight, Sparkles, Code, ExternalLink 
} from 'lucide-react';

interface CustomerHomeProps {
  settings: BusinessSettings;
  onNavigate: (tab: string) => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ settings, onNavigate }) => {
  const brands = ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Haier', 'Godrej', 'Panasonic', 'Videocon'];

  const problems = [
    { name: 'Not Starting', desc: 'Power light on or machine completely dead' },
    { name: 'Not Draining Water', desc: 'Water stays inside drum after wash' },
    { name: 'Making Noise', desc: 'Loud rattling or grinding sound during spin' },
    { name: 'Not Spinning', desc: 'Drum does not spin or dry clothes' },
    { name: 'Water Leakage', desc: 'Water leaking from bottom or door seal' },
    { name: 'Error Code', desc: 'Display panel showing error code (OE, 4E, etc.)' }
  ];

  const primaryPhone = (settings.phone && settings.phone.includes('99260')) ? settings.phone : '+91 9926064529';
  const secondaryPhone = (settings.secondaryPhone && settings.secondaryPhone.includes('98262')) ? settings.secondaryPhone : '+91 9826247802';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      



      {/* Hero Section */}
      <section 
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '20px', 
          padding: '2.5rem 1.5rem', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px -2px rgba(29, 78, 216, 0.06)'
        }}
        className="hero-grid hero-section"
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.85rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem', border: '1px solid #bfdbfe' }}>
            <Zap size={15} /> #1 Doorstep Washing Machine Service
          </div>
          
          <h1 className="hero-title" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Washing Machine Repair <span style={{ color: '#1d4ed8' }}>Made Easy</span>
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#475569', marginBottom: '2rem', lineHeight: 1.6 }}>
            Book a repair service at your home in just a few steps. Fast turnaround, transparent pricing, and 30-day service warranty.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginBottom: '2rem' }}>
            <button 
              onClick={() => onNavigate('book-repair')}
              className="btn btn-primary btn-lg"
              style={{ minWidth: '180px' }}
            >
              <Wrench size={20} /> Book a Repair
            </button>

            <button 
              onClick={() => onNavigate('track-complaint')}
              className="btn btn-secondary btn-lg"
            >
              <Search size={20} /> Track Complaint
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
                <Phone size={16} style={{ color: '#2563eb' }} /> Alt: {secondaryPhone}
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
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Ready to Book a Repair Service?
          </h3>
          <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>
            No upfront payments. Pay only after machine repair and testing.
          </p>
        </div>

        <button className="btn" style={{ backgroundColor: '#ffffff', color: '#1d4ed8', fontWeight: 800, fontSize: '0.95rem' }}>
          Book Service Now →
        </button>
      </div>

      {/* Common Problems Section */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem' }}>
            Common Washing Machine Issues We Fix
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Select your issue to quickly register a complaint
          </p>
        </div>

        <div className="grid-3">
          {problems.map((prob) => (
            <div 
              key={prob.name} 
              onClick={() => onNavigate('book-repair')}
              className="card card-interactive" 
              style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {prob.name}
                <ArrowRight size={16} style={{ color: '#2563eb' }} />
              </div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.4' }}>
                {prob.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Brands We Service */}
      <div className="card" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center', padding: '2rem 1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '1rem' }}>
          We Repair All Major Brands
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem' }}>
          {brands.map(b => (
            <span 
              key={b} 
              style={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #cbd5e1', 
                padding: '0.5rem 1.25rem', 
                borderRadius: '999px', 
                fontWeight: 700, 
                color: '#1e293b', 
                fontSize: '0.9rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Full Developer Showcase Card with Scroll Reveal Animation */}
      <section 
        className="dev-card-scroll-appear"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          color: '#ffffff',
          boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.4), 0 0 30px rgba(59, 130, 246, 0.25)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background radial glow */}
        <div style={{ position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />

        {/* Enlarged Developer Profile Photo */}
        <div style={{ position: 'relative', margin: '0 auto', zIndex: 1 }}>
          <div 
            style={{ 
              width: '130px', 
              height: '130px', 
              borderRadius: '50%', 
              padding: '4px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
              boxShadow: '0 0 35px rgba(99, 102, 241, 0.6), 0 0 15px rgba(236, 72, 153, 0.4)',
              animation: 'pulseGlow 3s infinite alternate'
            }}
          >
            <img 
              src="/profile.jpg" 
              alt="Mustansir Murtaza Sanawadwala - Lead Web Developer" 
              style={{ 
                width: '100%', 
                height: '100%', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '3px solid #0f172a'
              }}
            />
          </div>
          
          <div style={{ position: 'absolute', bottom: '5px', right: '5px', backgroundColor: '#2563eb', color: '#ffffff', padding: '6px', borderRadius: '50%', border: '2px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} />
          </div>
        </div>

        {/* Developer Info */}
        <div style={{ maxWidth: '680px', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.9rem', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '999px', fontSize: '0.825rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(129, 140, 248, 0.3)', marginBottom: '0.75rem' }}>
            <Code size={14} /> Lead Full-Stack Developer & Software Architect
          </div>

          <h2 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#ffffff', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Mustansir Murtaza Sanawadwala
          </h2>

          <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Creator & Architect of the <strong>Washing Machine Care</strong> web platform (<a href="https://washingmachinecare.shop" style={{ color: '#60a5fa', textDecoration: 'underline' }}>washingmachinecare.shop</a>). Engineered with ultra-fast PWA performance, real-time Firebase sync & instant audio dispatch alerts.
          </p>

          {/* Tech Stack Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
            {['React', 'TypeScript', 'Firebase Cloud', 'PWA Engine', 'Web Audio API', 'SEO Engineered'].map(tech => (
              <span key={tech} style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#93c5fd', fontSize: '0.78rem', fontWeight: 700, padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(147, 197, 253, 0.2)' }}>
                {tech}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.85rem' }}>
            <a 
              href="https://mustansir.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.95rem',
                padding: '0.75rem 1.6rem',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
                transition: 'all 0.2s ease'
              }}
            >
              Visit Developer Portfolio <ExternalLink size={16} />
            </a>

            <a 
              href="https://mustansir.vercel.app/#contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Contact Developer ✉️
            </a>
          </div>
        </div>
      </section>

      {/* Animation Styles */}
      <style>{`
        @keyframes devCardSlideUp {
          0% {
            opacity: 0;
            transform: translateY(35px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 25px rgba(99, 102, 241, 0.5), 0 0 10px rgba(236, 72, 153, 0.3);
          }
          100% {
            box-shadow: 0 0 45px rgba(99, 102, 241, 0.85), 0 0 20px rgba(236, 72, 153, 0.6);
          }
        }

        .dev-card-scroll-appear {
          animation: devCardSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

    </div>
  );
};
