import React, { useState } from 'react';
import type { UserSession } from '../../types';
import { Menu, X, Shield, User, Phone, Search, PlusCircle, LogOut, Smartphone } from 'lucide-react';
import { AdminLoginModal } from '../admin/AdminLoginModal';

interface HeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  session: UserSession;
  onSessionChange: (session: UserSession) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  session,
  onSessionChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [loginModalTarget, setLoginModalTarget] = useState<'admin' | 'staff' | null>(null);

  const handleNavClick = (tab: string) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const handleRoleSelect = (role: 'customer' | 'admin' | 'staff') => {
    if (role === 'customer') {
      onSessionChange({ role: 'customer', name: 'Customer Guest', email: 'guest@washingmachinecare.shop' });
      onNavigate('home');
      setRoleDropdownOpen(false);
      setMobileMenuOpen(false);
    } else {
      // If switching to admin/staff, trigger security PIN modal
      setLoginModalTarget(role);
      setRoleDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const handleTriggerInstall = () => {
    setMobileMenuOpen(false);
    // Find install button on home page or trigger prompt
    const installBanner = document.getElementById('pwa-install-banner');
    if (installBanner) {
      installBanner.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('home');
    }
  };

  return (
    <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => handleNavClick(session.role === 'admin' || session.role === 'staff' ? 'admin-dashboard' : 'home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <img 
            src="/logo.png" 
            alt="Washing Machine Care Logo" 
            style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              Washing Machine Care
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', letterSpacing: '0.02em' }}>
              washingmachinecare.shop
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          {session.role === 'customer' ? (
            <>
              <button 
                onClick={() => handleNavClick('home')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'home' ? 700 : 500, color: currentTab === 'home' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Home
              </button>
              <button 
                onClick={() => handleNavClick('book-repair')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'book-repair' ? 700 : 500, color: currentTab === 'book-repair' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <PlusCircle size={16} /> Book Repair
              </button>
              <button 
                onClick={() => handleNavClick('track-complaint')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'track-complaint' ? 700 : 500, color: currentTab === 'track-complaint' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Search size={16} /> Track Complaint
              </button>
              <button 
                onClick={() => handleNavClick('contact')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'contact' ? 700 : 500, color: currentTab === 'contact' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Phone size={16} /> Contact
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleNavClick('admin-dashboard')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'admin-dashboard' ? 700 : 500, color: currentTab === 'admin-dashboard' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleNavClick('admin-complaints')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'admin-complaints' ? 700 : 500, color: currentTab === 'admin-complaints' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Complaints
              </button>
              <button 
                onClick={() => handleNavClick('admin-analytics')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'admin-analytics' ? 700 : 500, color: currentTab === 'admin-analytics' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Reports
              </button>
              <button 
                onClick={() => handleNavClick('admin-settings')} 
                style={{ background: 'none', border: 'none', fontWeight: currentTab === 'admin-settings' ? 700 : 500, color: currentTab === 'admin-settings' ? '#1d4ed8' : '#475569', cursor: 'pointer', fontSize: '0.95rem' }}
              >
                Settings
              </button>
            </>
          )}

          {/* Install App Button */}
          <button 
            onClick={handleTriggerInstall}
            className="btn btn-sm btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, borderRadius: '20px', padding: '0.35rem 0.85rem' }}
          >
            <Smartphone size={14} /> Install App 📱
          </button>

          {/* Role Switcher Pill */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="btn btn-sm btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '0.35rem 0.85rem' }}
            >
              {session.role === 'admin' ? <Shield size={14} style={{ color: '#1d4ed8' }} /> : <User size={14} style={{ color: '#059669' }} />}
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {session.role === 'admin' ? 'Admin Portal' : session.role === 'staff' ? 'Staff View' : 'Customer View'}
              </span>
            </button>

            {roleDropdownOpen && (
              <div 
                style={{ 
                  position: 'absolute', right: 0, top: '110%', width: '210px', backgroundColor: '#ffffff', 
                  borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', 
                  border: '1px solid #e2e8f0', padding: '0.5rem', zIndex: 200 
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', padding: '0.35rem 0.6rem', textTransform: 'uppercase' }}>
                  Portal Access
                </div>
                
                {session.role !== 'customer' ? (
                  <button 
                    onClick={() => handleRoleSelect('customer')} 
                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', borderRadius: '6px', border: 'none', background: '#fef2f2', fontWeight: 600, color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
                  >
                    <LogOut size={14} /> Exit Admin / Sign Out
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleRoleSelect('customer')} 
                      style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', borderRadius: '6px', border: 'none', background: '#eff6ff', fontWeight: 700, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <User size={14} style={{ color: '#16a34a' }} /> Public Customer View
                    </button>
                    <button 
                      onClick={() => handleRoleSelect('admin')} 
                      style={{ width: '100%', textAlign: 'left', padding: '0.5rem 0.6rem', borderRadius: '6px', border: 'none', background: 'transparent', fontWeight: 500, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      <Shield size={14} style={{ color: '#1d4ed8' }} /> Admin Portal 🔒
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Button */}
        <div style={{ display: 'none' }} className="mobile-toggle">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: '#0f172a' }}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={handleTriggerInstall} className="btn btn-primary btn-block" style={{ fontWeight: 800 }}>
            📱 Install App (PWA)
          </button>

          {session.role === 'customer' ? (
            <>
              <button onClick={() => handleNavClick('home')} className="btn btn-secondary btn-block">Home</button>
              <button onClick={() => handleNavClick('book-repair')} className="btn btn-primary btn-block">🔧 Book a Repair</button>
              <button onClick={() => handleNavClick('track-complaint')} className="btn btn-secondary btn-block">🔍 Track Complaint</button>
              <button onClick={() => handleNavClick('contact')} className="btn btn-secondary btn-block">📞 Contact Us</button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavClick('admin-dashboard')} className="btn btn-secondary btn-block">Dashboard</button>
              <button onClick={() => handleNavClick('admin-complaints')} className="btn btn-secondary btn-block">Complaints</button>
              <button onClick={() => handleNavClick('admin-analytics')} className="btn btn-secondary btn-block">Reports & Analytics</button>
              <button onClick={() => handleNavClick('admin-settings')} className="btn btn-secondary btn-block">Settings</button>
            </>
          )}

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>PORTAL ACCESS:</div>
            {session.role !== 'customer' ? (
              <button onClick={() => handleRoleSelect('customer')} className="btn btn-sm btn-secondary btn-block" style={{ color: '#dc2626' }}>
                <LogOut size={14} /> Exit Admin / Sign Out
              </button>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button onClick={() => handleRoleSelect('customer')} className="btn btn-sm btn-secondary">Customer</button>
                <button onClick={() => handleRoleSelect('admin')} className="btn btn-sm btn-primary">Admin 🔒</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security PIN Authentication Modal */}
      {loginModalTarget && (
        <AdminLoginModal 
          isOpen={true}
          targetRole={loginModalTarget}
          onClose={() => setLoginModalTarget(null)}
          onSuccess={(newSession) => {
            onSessionChange(newSession);
            onNavigate('admin-dashboard');
          }}
        />
      )}

      {/* Inline style responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
};
