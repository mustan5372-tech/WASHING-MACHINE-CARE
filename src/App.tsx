import { useState, useEffect } from 'react';
import type { Complaint, BusinessSettings, UserSession } from './types';
import { 
  getComplaints, 
  getSettings, addAuditLog 
} from './services/storage';

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

export function App() {
  const [complaints, setComplaints] = useState<Complaint[]>(getComplaints());
  const [settings, setSettings] = useState<BusinessSettings>(getSettings());
  const [session, setSessionState] = useState<UserSession>({
    role: 'customer',
    name: 'Customer Guest',
    email: 'guest@washingmachinecare.shop'
  });

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [trackParamId, setTrackParamId] = useState<string>('');

  // Active Modals
  const [selectedComplaintDetail, setSelectedComplaintDetail] = useState<Complaint | null>(null);
  const [selectedInvoiceComplaint, setSelectedInvoiceComplaint] = useState<Complaint | null>(null);
  const [showNewComplaintModal, setShowNewComplaintModal] = useState<boolean>(false);

  // Sync state from storage
  const reloadData = () => {
    setComplaints(getComplaints());
    setSettings(getSettings());
  };

  useEffect(() => {
    reloadData();
  }, [currentTab]);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    if (param) setTrackParamId(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSessionChange = (newSession: UserSession) => {
    setSessionState(newSession);
    addAuditLog(newSession.name, 'SWITCH_ROLE', `Switched role to ${newSession.role}`);
  };

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

        {/* ADMIN PORTAL VIEWS */}
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

      </main>

      {/* Footer */}
      <Footer 
        settings={settings}
        onNavigate={handleNavigate}
      />

      {/* MODALS */}

      {/* Complaint Detail Modal */}
      {selectedComplaintDetail && (
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
      {showNewComplaintModal && (
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
