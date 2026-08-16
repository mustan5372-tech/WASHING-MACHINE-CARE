import { useState, useEffect } from 'react';
import type { Complaint, BusinessSettings, UserSession } from './types';
import { 
  getComplaints, 
  getSettings, addAuditLog 
} from './services/storage';
import { listenToComplaints } from './services/firebase';

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
import { Shield, Lock } from 'lucide-react';

/**
 * Route resolution helper for clean URL paths (/repair, /track-complaint, etc.)
 */
const getTabFromPath = (path: string, search: string): { tab: string; param?: string } => {
  const cleanPath = path.toLowerCase().replace(/\/$/, '');
  const searchParams = new URLSearchParams(search);
  const tabQuery = searchParams.get('tab');
  const idQuery = searchParams.get('id');

  if (tabQuery) {
    return { tab: tabQuery, param: idQuery || undefined };
  }

  if (cleanPath === '/repair' || cleanPath === '/book-repair') {
    return { tab: 'book-repair' };
  }
  if (cleanPath === '/track-complaint' || cleanPath === '/track') {
    return { tab: 'track-complaint', param: idQuery || undefined };
  }
  if (cleanPath === '/contact') {
    return { tab: 'contact' };
  }
  if (cleanPath === '/admin' || cleanPath === '/admin-dashboard') {
    return { tab: 'admin-dashboard' };
  }
  if (cleanPath === '/admin-complaints') {
    return { tab: 'admin-complaints' };
  }
  if (cleanPath === '/admin-analytics') {
    return { tab: 'admin-analytics' };
  }
  if (cleanPath === '/admin-settings') {
    return { tab: 'admin-settings' };
  }

  return { tab: 'home' };
};

/**
 * Convert tab key into clean URL path
 */
const getPathFromTab = (tab: string, param?: string): string => {
  switch (tab) {
    case 'book-repair':
      return '/repair';
    case 'track-complaint':
      return param ? `/track-complaint?id=${param}` : '/track-complaint';
    case 'contact':
      return '/contact';
    case 'admin-dashboard':
      return '/admin';
    case 'admin-complaints':
      return '/admin-complaints';
    case 'admin-analytics':
      return '/admin-analytics';
    case 'admin-settings':
      return '/admin-settings';
    case 'home':
    default:
      return '/';
  }
};

export function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [settings, setSettings] = useState<BusinessSettings>(getSettings());
  const [session, setSessionState] = useState<UserSession>({
    role: 'customer',
    name: 'Customer Guest',
    email: 'guest@washingmachinecare.shop'
  });

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
    setComplaints(getComplaints());
    setSettings(getSettings());
  };

  useEffect(() => {
    reloadData();

    // Subscribe to Firebase Cloud Firestore updates
    const unsubscribe = listenToComplaints((remoteComplaints) => {
      if (remoteComplaints && remoteComplaints.length > 0) {
        setComplaints(remoteComplaints);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentTab]);

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
    addAuditLog(newSession.name, 'SWITCH_ROLE', `Switched role to ${newSession.role}`);
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
            {(currentTab === 'admin-dashboard' || currentTab === 'admin-complaints') && (
              <AdminDashboard 
                complaints={complaints}
                settings={settings}
                onOpenComplaintDetail={(c) => setSelectedComplaintDetail(c)}
                onOpenNewComplaintModal={() => setShowNewComplaintModal(true)}
                onNavigate={handleNavigate}
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

      {/* Footer */}
      <Footer 
        settings={settings}
        onNavigate={handleNavigate}
      />

      {/* MODALS */}

      {/* Complaint Detail Modal */}
      {selectedComplaintDetail && isAdminOrStaff && (
        <ComplaintDetailModal 
          complaint={selectedComplaintDetail}
          settings={settings}
          onClose={() => {
            setSelectedComplaintDetail(null);
            reloadData();
          }}
          onOpenInvoice={(c) => {
            setSelectedComplaintDetail(null);
            setSelectedInvoiceComplaint(c);
          }}
        />
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoiceComplaint && (
        <InvoiceModal 
          complaint={selectedInvoiceComplaint}
          settings={settings}
          onClose={() => setSelectedInvoiceComplaint(null)}
        />
      )}

      {/* Admin New Complaint Modal */}
      {showNewComplaintModal && isAdminOrStaff && (
        <NewComplaintModal 
          settings={settings}
          onClose={() => setShowNewComplaintModal(false)}
          onSuccess={(newC) => {
            setShowNewComplaintModal(false);
            reloadData();
            setSelectedComplaintDetail(newC);
          }}
        />
      )}

    </div>
  );
}

export default App;
