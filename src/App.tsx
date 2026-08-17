import { useState, useEffect, useRef } from 'react';
import type { Complaint, BusinessSettings, UserSession } from './types';
import { 
  getComplaints, 
  getSettings, addAuditLog 
} from './services/storage';
import { listenToComplaints } from './services/firebase';
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

/**
 * Play a web notification audio chime
 */
const playNotificationChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Audio Context restricted before user interaction
  }
};

export function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [settings, setSettings] = useState<BusinessSettings>(getSettings());
  
  // Persistent session state (restores logged in Admin/Staff session automatically)
  const [session, setSessionState] = useState<UserSession>(getSavedUserSession());

  // Notification Permission State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  // In-app Toast Banner for New Bookings
  const [newBookingToast, setNewBookingToast] = useState<Complaint | null>(null);

  // Track known complaint IDs to trigger new booking alerts
  const knownComplaintIdsRef = useRef<Set<string>>(new Set(getComplaints().map(c => c.id)));
  const isInitialSyncRef = useRef<boolean>(true);

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

  // Request browser Notification permission
  const requestNotificationAccess = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        setNotificationPermission(perm);
      });
    }
  };

  // Sync state from local storage & Firebase real-time
  const reloadData = () => {
    const fresh = getComplaints();
    setComplaints(fresh);
    setSettings(getSettings());
  };

  useEffect(() => {
    reloadData();

    // Auto-refresh when PWA app is opened or gains focus
    const handleAppFocus = () => {
      if (document.visibilityState === 'visible') {
        reloadData();
        if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(reg => reg.update());
        }
      }
    };

    window.addEventListener('visibilitychange', handleAppFocus);
    window.addEventListener('focus', handleAppFocus);

    const handleCustomUpdate = () => reloadData();
    window.addEventListener('wmc_complaints_updated', handleCustomUpdate);

    // Subscribe to Firebase Cloud Firestore real-time updates
    const unsubscribe = listenToComplaints((remoteComplaints) => {
      if (remoteComplaints && remoteComplaints.length > 0) {
        // Identify newly added complaints
        const newlyAdded = remoteComplaints.filter(c => !knownComplaintIdsRef.current.has(c.id));

        if (newlyAdded.length > 0 && !isInitialSyncRef.current) {
          const newest = newlyAdded[0];
          setNewBookingToast(newest);
          playNotificationChime();

          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🚨 New Repair Request Booked!', {
              body: `${newest.id}: ${newest.customer.name} - ${newest.machine.brand} (${newest.customer.mobile})`,
              icon: '/logo.png',
              tag: newest.id
            });
          }
        }

        knownComplaintIdsRef.current = new Set(remoteComplaints.map(c => c.id));
        isInitialSyncRef.current = false;
        setComplaints(remoteComplaints);
      }
    });

    return () => {
      window.removeEventListener('visibilitychange', handleAppFocus);
      window.removeEventListener('focus', handleAppFocus);
      window.removeEventListener('wmc_complaints_updated', handleCustomUpdate);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    if (param) setTrackParamId(param);

    // Push clean path to browser address bar
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
      requestNotificationAccess();
    }
    addAuditLog(newSession.name, 'SWITCH_ROLE', `Switched role to ${newSession.role}`);
  };

  const handleDeleteComplaint = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id.toLowerCase() !== id.toLowerCase()));
  };

  // Helper check for admin authorization
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

      {/* Real-time In-App Notification Toast Banner */}
      {newBookingToast && (
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1rem 1.5rem',
          margin: '1rem max(1rem, calc((100vw - 1200px) / 2))',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: '6px solid #22c55e',
          gap: '1rem',
          zIndex: 99
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Bell size={24} style={{ color: '#4ade80', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '1rem', color: '#4ade80' }}>🚨 NEW REPAIR BOOKING RECEIVED!</strong>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                Complaint <strong>{newBookingToast.id}</strong> by <strong>{newBookingToast.customer.name}</strong> ({newBookingToast.machine.brand} - {newBookingToast.customer.mobile})
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button 
              onClick={() => {
                setSelectedComplaintDetail(newBookingToast);
                setNewBookingToast(null);
              }}
              className="btn btn-sm btn-primary"
              style={{ backgroundColor: '#2563eb', fontWeight: 700 }}
            >
              View Booking
            </button>
            <button 
              onClick={() => setNewBookingToast(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem' }}
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

        {/* ADMIN PORTAL VIEWS (Restricted to Authorized Admin/Staff Sessions Only) */}
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
            {isAdminOrStaff && notificationPermission !== 'granted' && (
              <div style={{ maxWidth: '1200px', margin: '1rem auto 0 auto', padding: '0 1rem' }}>
                <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#1e40af', fontWeight: 600 }}>
                    <Bell size={18} style={{ color: '#2563eb' }} />
                    <span>Enable Admin Desktop & Mobile Push Notifications to get instant sound & screen alerts when a customer books a repair!</span>
                  </div>
                  <button onClick={requestNotificationAccess} className="btn btn-sm btn-primary" style={{ fontWeight: 700 }}>
                    Enable Push Alerts 🔔
                  </button>
                </div>
              </div>
            )}

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
