import { useState, useEffect } from 'react';
import type { Complaint, BusinessSettings, UserSession } from './types';
import { 
  getComplaints, 
  getSettings, addAuditLog, getDeletedComplaintIds 
} from './services/storage';
import { listenToComplaints, playLoudInWebsiteBeep } from './services/firebase';
import { getSavedUserSession, saveUserSession, clearUserSession } from './services/accounts';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

import { CustomerHome } from './components/customer/CustomerHome';
import { MultiStepForm } from './components/customer/MultiStepForm';
import { TrackComplaint } from './components/customer/TrackComplaint';
import { ContactPage } from './components/customer/ContactPage';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { ComplaintDetailModal } from './components/admin/ComplaintDetailModal';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminSettings } from './components/admin/AdminSettings';
import { NewComplaintModal } from './components/admin/NewComplaintModal';

import { InvoiceModal } from './components/invoice/InvoiceModal';
import { Shield, Lock, Bell } from 'lucide-react';

/**
 * Route resolution helper for clean URL paths (/repair, /track-complaint, etc.)
 */
const getTabFromPath = (path: string, search: string): { tab: string; param?: string } => {
  const urlParams = new URLSearchParams(search);
  const idFromQuery = urlParams.get('id');

  const cleanPath = path.toLowerCase().replace(/\/$/, '');

  if (cleanPath.startsWith('/track')) {
    const parts = cleanPath.split('/track/');
    const idFromPath = parts[1] || idFromQuery || '';
    return { tab: 'track-complaint', param: idFromPath };
  }

  switch (cleanPath) {
    case '/repair':
    case '/book':
      return { tab: 'book-repair' };
    case '/contact':
      return { tab: 'contact' };
    case '/admin':
    case '/admin/dashboard':
      return { tab: 'admin-dashboard' };
    case '/admin/complaints':
      return { tab: 'admin-complaints' };
    case '/admin/reports':
    case '/admin/analytics':
      return { tab: 'admin-analytics' };
    case '/admin/settings':
      return { tab: 'admin-settings' };
    default:
      return { tab: 'home' };
  }
};

/**
 * Helper to construct clean browser history path
 */
const getPathFromTab = (tab: string, param?: string): string => {
  switch (tab) {
    case 'book-repair':
      return '/repair';
    case 'track-complaint':
      return param ? `/track/${param}` : '/track';
    case 'contact':
      return '/contact';
    case 'admin-dashboard':
      return '/admin';
    case 'admin-complaints':
      return '/admin/complaints';
    case 'admin-analytics':
      return '/admin/reports';
    case 'admin-settings':
      return '/admin/settings';
    default:
      return '/';
  }
};

export function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [settings, setSettings] = useState<BusinessSettings>(getSettings());
  
  // Persistent session state (restores logged in Admin/Staff session automatically)
  const [session, setSessionState] = useState<UserSession>(getSavedUserSession());

  // In-app Toast Banner for New Bookings
  const [newBookingToast, setNewBookingToast] = useState<Complaint | null>(null);

  // Initialize route state from current browser URL
  const initialRoute = getTabFromPath(window.location.pathname, window.location.search);
  const [currentTab, setCurrentTab] = useState<string>(initialRoute.tab);
  const [trackParamId, setTrackParamId] = useState<string>(initialRoute.param || '');

  // Active Modals
  const [selectedComplaintDetail, setSelectedComplaintDetail] = useState<Complaint | null>(null);
  const [selectedInvoiceComplaint, setSelectedInvoiceComplaint] = useState<Complaint | null>(null);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState<boolean>(false);

  // Handle browser Back / Forward navigation button clicks
  useEffect(() => {
    const handlePopState = () => {
      const route = getTabFromPath(window.location.pathname, window.location.search);
      setCurrentTab(route.tab);
      if (route.param) setTrackParamId(route.param);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync state from local storage & Firebase real-time
  const reloadData = () => {
    const fresh = getComplaints();
    setComplaints(fresh);
    setSettings(getSettings());
  };

  useEffect(() => {
    reloadData();

    // PWA Auto-refresh whenever app gains focus or is opened
    const handleAppFocus = () => {
      if (document.visibilityState === 'visible') {
        reloadData();
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(reg => reg.update()).catch(() => {});
        }
      }
    };

    const handleCustomUpdate = () => reloadData();

    const getAlertedComplaintIds = (): string[] => {
      try {
        const raw = sessionStorage.getItem('wmc_alerted_ids');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    };

    const markComplaintAsAlerted = (id: string) => {
      try {
        const ids = getAlertedComplaintIds();
        if (!ids.includes(id.toLowerCase())) {
          ids.push(id.toLowerCase());
          sessionStorage.setItem('wmc_alerted_ids', JSON.stringify(ids));
        }
      } catch (e) {}
    };

    const triggerInWebsiteLoudAlert = (complaint: Complaint) => {
      if (!complaint || !complaint.id) return;
      const lowerId = complaint.id.toLowerCase();
      const alerted = getAlertedComplaintIds();
      if (alerted.includes(lowerId)) return;

      markComplaintAsAlerted(lowerId);

      setNewBookingToast(complaint);

      // Play LOUD audio chime beep on website
      playLoudInWebsiteBeep();

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([500, 200, 500, 200, 1000]);
        } catch (e) {}
      }
    };

    const handleNewBookingCreated = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        triggerInWebsiteLoudAlert(customEvent.detail);
      }
    };

    // Unlock audio context on initial user gesture
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
        }
      } catch (e) {}
    };
    window.addEventListener('touchstart', unlockAudio, { once: true });
    window.addEventListener('click', unlockAudio, { once: true });

    window.addEventListener('visibilitychange', handleAppFocus);
    window.addEventListener('focus', handleAppFocus);
    window.addEventListener('pageshow', handleAppFocus);
    window.addEventListener('online', handleAppFocus);
    window.addEventListener('wmc_complaints_updated', handleCustomUpdate);
    window.addEventListener('wmc_new_booking_created', handleNewBookingCreated);

    let isInitialSnapshotLoad = true;

    // Subscribe to Firebase Cloud Firestore real-time updates (Syncs across all accounts & devices)
    const unsubscribe = listenToComplaints((remoteComplaints) => {
      if (Array.isArray(remoteComplaints)) {
        try {
          const deletedIds = getDeletedComplaintIds();
          const filtered = remoteComplaints.filter(c => c && c.id && !deletedIds.includes(c.id.toLowerCase()));
          localStorage.setItem('wmc_complaints_v1', JSON.stringify(filtered));
        } catch (e) {}

        const alerted = getAlertedComplaintIds();

        if (isInitialSnapshotLoad) {
          remoteComplaints.forEach(c => {
            if (c && c.id) {
              const lower = c.id.toLowerCase();
              if (!alerted.includes(lower)) {
                markComplaintAsAlerted(lower);
              }
            }
          });
          isInitialSnapshotLoad = false;
        } else {
          remoteComplaints.forEach(complaint => {
            if (complaint && complaint.id) {
              const lower = complaint.id.toLowerCase();
              if (!alerted.includes(lower)) {
                triggerInWebsiteLoudAlert(complaint);
              }
            }
          });
        }

        setComplaints(remoteComplaints);
      }
    });

    return () => {
      window.removeEventListener('visibilitychange', handleAppFocus);
      window.removeEventListener('focus', handleAppFocus);
      window.removeEventListener('pageshow', handleAppFocus);
      window.removeEventListener('online', handleAppFocus);
      window.removeEventListener('wmc_complaints_updated', handleCustomUpdate);
      window.removeEventListener('wmc_new_booking_created', handleNewBookingCreated);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    if (param) setTrackParamId(param);

    const newPath = getPathFromTab(tab, param);
    if (window.location.pathname + window.location.search !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSessionChange = (newSession: UserSession) => {
    setSessionState(newSession);
    if (newSession.role === 'customer') {
      clearUserSession();
    } else {
      saveUserSession(newSession);
    }
    addAuditLog(newSession.name, 'SWITCH_ROLE', `Switched role to ${newSession.role}`);
  };

  const handleDeleteComplaint = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id.toLowerCase() !== id.toLowerCase()));
  };

  const isAdminOrStaff = session.role === 'admin' || session.role === 'staff';

  return (
    <div className="app-container">
      
      {/* Header Bar */}
      <Header 
        currentTab={currentTab}
        onNavigate={handleNavigate}
        session={session}
        onSessionChange={handleSessionChange}
      />

      {/* Loud In-Website Emergency Alert Banner Modal */}
      {newBookingToast && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 2rem)',
          maxWidth: '650px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 2px #22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          zIndex: 99999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ backgroundColor: '#22c55e', color: '#000000', padding: '0.65rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={26} />
            </div>
            <div>
              <strong style={{ fontSize: '1.05rem', color: '#4ade80', display: 'block' }}>🚨 NEW REPAIR BOOKING RECEIVED!</strong>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', marginTop: '0.2rem' }}>
                ID: <strong>{newBookingToast.id}</strong> | <strong>{newBookingToast.customer.name}</strong> ({newBookingToast.customer.mobile})
              </div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                {newBookingToast.machine.brand} • {newBookingToast.problem.selectedProblems.join(', ')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <a 
              href={`tel:${newBookingToast.customer.mobile}`}
              className="btn btn-sm"
              style={{ backgroundColor: '#1e293b', color: '#38bdf8', border: '1px solid #38bdf8', fontWeight: 700, padding: '0.45rem 0.85rem', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              📞 Call Customer
            </a>
            <button 
              onClick={() => {
                setSelectedComplaintDetail(newBookingToast);
                setNewBookingToast(null);
              }}
              className="btn btn-sm btn-primary"
              style={{ backgroundColor: '#2563eb', fontWeight: 700, padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
            >
              📱 View Details
            </button>
            <button 
              onClick={() => setNewBookingToast(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.4rem', padding: '0 0.5rem' }}
              title="Dismiss Alert"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="main-content">
        
        {/* CUSTOMER PORTAL VIEWS */}
        {currentTab === 'home' && (
          <CustomerHome 
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'book-repair' && (
          <MultiStepForm 
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'track-complaint' && (
          <TrackComplaint 
            settings={settings}
            initialComplaintId={trackParamId}
            onOpenInvoice={(complaint) => setSelectedInvoiceComplaint(complaint)}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage 
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {/* ADMIN PORTAL VIEWS */}
        {(currentTab === 'admin-dashboard' || currentTab === 'admin-complaints' || currentTab === 'admin-analytics' || currentTab === 'admin-settings') && !isAdminOrStaff ? (
          <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '2.5rem', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <Lock size={32} style={{ color: '#dc2626' }} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Admin Portal Restricted</h2>
            <p style={{ color: '#64748b', margin: '0.75rem 0 1.5rem 0' }}>
              This section contains sensitive customer data, service revenue, and financial reports. Access is restricted to authorized admin accounts.
            </p>
            <button 
              onClick={() => handleNavigate('home')} 
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Shield size={16} /> Return to Home
            </button>
          </div>
        ) : (
          <>
            {(currentTab === 'admin-dashboard' || currentTab === 'admin-complaints') && (
              <AdminDashboard 
                complaints={complaints}
                settings={settings}
                onOpenComplaintDetail={(c) => setSelectedComplaintDetail(c)}
                onOpenNewComplaintModal={() => setShowNewComplaintModal(true)}
                onNavigate={handleNavigate}
                onDeleteComplaint={handleDeleteComplaint}
              />
            )}

            {currentTab === 'admin-analytics' && (
              <AdminAnalytics 
                complaints={complaints}
              />
            )}

            {currentTab === 'admin-settings' && (
              <AdminSettings 
                settings={settings}
                onUpdateSettings={(newSet) => setSettings(newSet)}
              />
            )}
          </>
        )}

      </main>

      {/* Footer Component */}
      <Footer 
        settings={settings}
        onNavigate={handleNavigate}
      />

      {/* ACTIVE MODALS & OVERLAYS */}
      
      {/* 1. Complaint Detail & Service Status Modal */}
      {selectedComplaintDetail && (
        <ComplaintDetailModal 
          complaint={selectedComplaintDetail}
          settings={settings}
          onClose={() => setSelectedComplaintDetail(null)}
          onOpenInvoice={(complaint) => {
            setSelectedComplaintDetail(null);
            setSelectedInvoiceComplaint(complaint);
          }}
        />
      )}

      {/* 2. New Complaint Modal (Admin Created) */}
      {showNewComplaintModal && (
        <NewComplaintModal 
          settings={settings}
          onClose={() => setShowNewComplaintModal(false)}
          onSuccess={() => {
            setShowNewComplaintModal(false);
            reloadData();
          }}
        />
      )}

      {/* 3. Invoice & Warranty PDF Modal */}
      {selectedInvoiceComplaint && (
        <InvoiceModal 
          complaint={selectedInvoiceComplaint}
          settings={settings}
          onClose={() => setSelectedInvoiceComplaint(null)}
        />
      )}

    </div>
  );
}

export default App;
