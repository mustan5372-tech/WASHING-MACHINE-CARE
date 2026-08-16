import React, { useState, useEffect } from 'react';
import type { Complaint, BusinessSettings } from '../../types';
import { getComplaintById, getComplaints } from '../../services/storage';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Search, CheckCircle2, Clock, Phone, Wrench, Calendar, 
  FileText, AlertCircle, MessageSquare 
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

interface TrackComplaintProps {
  settings: BusinessSettings;
  initialComplaintId?: string;
  onOpenInvoice?: (complaint: Complaint) => void;
}

export const TrackComplaint: React.FC<TrackComplaintProps> = ({
  settings,
  initialComplaintId = '',
  onOpenInvoice
}) => {
  const [complaintIdInput, setComplaintIdInput] = useState<string>(initialComplaintId);
  const [mobileInput, setMobileInput] = useState<string>('');
  const [searchedComplaint, setSearchedComplaint] = useState<Complaint | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialComplaintId) {
      const found = getComplaintById(initialComplaintId);
      if (found) {
        setSearchedComplaint(found);
      }
    }
  }, [initialComplaintId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!complaintIdInput.trim()) {
      setErrorMsg('Please enter your Complaint ID (e.g. WMC-000101)');
      return;
    }

    const found = getComplaintById(complaintIdInput.trim());
    if (!found) {
      setErrorMsg(`No complaint record found with ID "${complaintIdInput.trim()}". Please check your ID and try again.`);
      setSearchedComplaint(null);
      return;
    }

    if (mobileInput.trim() && !found.customer.mobile.includes(mobileInput.trim())) {
      setErrorMsg('Mobile number does not match the record for this Complaint ID.');
      setSearchedComplaint(null);
      return;
    }

    setSearchedComplaint(found);
  };

  const timelineStages = [
    { label: 'Received', status: ['New Complaint'] },
    { label: 'Contacted', status: ['Contacted', 'Scheduled'] },
    { label: 'Inspection / Repair', status: ['Inspection', 'Repair In Progress', 'Waiting for Parts'] },
    { label: 'Completed', status: ['Repair Completed', 'Payment Pending', 'Paid'] }
  ];

  const getStageStatus = (stageStatuses: string[], currentStatus: string) => {
    const allStatuses = [
      'New Complaint', 'Contacted', 'Scheduled',
      'Inspection', 'Repair In Progress', 'Waiting for Parts',
      'Repair Completed', 'Payment Pending', 'Paid'
    ];

    const currentIndex = allStatuses.indexOf(currentStatus);
    const stageFirstStatus = stageStatuses[0];
    const stageIndex = allStatuses.indexOf(stageFirstStatus);

    if (currentIndex >= stageIndex + stageStatuses.length - 1) return 'completed';
    if (currentIndex >= stageIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Search Header */}
      <div className="card" style={{ padding: '2rem 1.5rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.35rem', textAlign: 'center' }}>
          🔍 Track Service Complaint Status
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Enter your Complaint ID (e.g. WMC-000101) to check live status
        </p>

        <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem' }} className="track-form-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <input 
              type="text" 
              placeholder="Complaint ID (e.g. WMC-000101)" 
              value={complaintIdInput}
              onChange={(e) => setComplaintIdInput(e.target.value.toUpperCase())}
              className="form-input"
              style={{ fontWeight: 700, letterSpacing: '0.03em' }}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <input 
              type="tel" 
              placeholder="Mobile Number (Optional)" 
              value={mobileInput}
              onChange={(e) => setMobileInput(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ height: '46px', padding: '0 1.5rem' }}>
            <Search size={18} /> Search
          </button>
        </form>

        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '10px', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Demo Search Chips */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.825rem', color: '#64748b' }}>
          <span>Try Demo IDs:</span>
          {getComplaints().slice(0, 3).map(c => (
            <button 
              key={c.id} 
              type="button"
              onClick={() => {
                setComplaintIdInput(c.id);
                setSearchedComplaint(c);
                setErrorMsg('');
              }}
              style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#1d4ed8' }}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Searched Complaint Display */}
      {searchedComplaint && (
        <div className="card animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
          
          {/* Top Status Banner */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>COMPLAINT NUMBER</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>{searchedComplaint.id}</h2>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Booked on {new Date(searchedComplaint.createdAt).toLocaleString()}
              </div>
            </div>

            <div>
              <StatusBadge status={searchedComplaint.status} />
            </div>
          </div>

          {/* Visual Step-by-Step Progress Timeline */}
          <div style={{ backgroundColor: '#f8fafc', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '1.25rem' }}>
              Service Repair Timeline
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {timelineStages.map((stage, idx) => {
                const stageState = getStageStatus(stage.status, searchedComplaint.status);
                const isComplete = stageState === 'completed';
                const isCurrent = stageState === 'current';

                return (
                  <React.Fragment key={stage.label}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', textAlign: 'center', flex: 1 }}>
                      <div 
                        style={{ 
                          width: '36px', height: '36px', borderRadius: '50%', 
                          backgroundColor: isComplete ? '#059669' : isCurrent ? '#1d4ed8' : '#e2e8f0', 
                          color: isComplete || isCurrent ? '#ffffff' : '#64748b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.9rem',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(29,78,216,0.2)' : 'none'
                        }}
                      >
                        {isComplete ? <CheckCircle2 size={20} /> : idx + 1}
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#1d4ed8' : '#475569' }}>
                        {stage.label}
                      </span>
                    </div>

                    {idx < timelineStages.length - 1 && (
                      <div style={{ height: '3px', flex: 1, backgroundColor: isComplete ? '#059669' : '#e2e8f0', marginTop: '-18px' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Machine & Problem Grid */}
          <div className="grid-2" style={{ marginBottom: '1.75rem' }}>
            
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={16} /> Appliance & Problem Details
              </h4>
              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155' }}>
                <div><strong>Brand:</strong> {searchedComplaint.machine.brand}</div>
                <div><strong>Machine Type:</strong> {searchedComplaint.machine.type}</div>
                <div><strong>Reported Problem:</strong> {searchedComplaint.problem.selectedProblems.join(', ')}</div>
                {searchedComplaint.problem.errorCode && (
                  <div><strong>Error Code:</strong> <span style={{ backgroundColor: '#fef08a', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>{searchedComplaint.problem.errorCode}</span></div>
                )}
              </div>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} /> Customer Contact & Helpline
              </h4>
              <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#334155' }}>
                <div><strong>Customer Name:</strong> {searchedComplaint.customer.name}</div>
                <div><strong>Phone Number:</strong> {searchedComplaint.customer.mobile}</div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <a href={`tel:${settings.phone}`} className="btn btn-sm btn-secondary">
                    <Phone size={14} /> Call Helpline
                  </a>
                  <a 
                    href={buildWhatsAppUrl(settings.whatsapp, `Hello, checking status for Complaint ${searchedComplaint.id}`)}
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-sm btn-success"
                  >
                    <MessageSquare size={14} /> WhatsApp Support
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* Completed Repair Invoice / Charges Summary */}
          {searchedComplaint.serviceRecord && (
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={18} /> Service Bill & Payment Summary
                </h4>

                <span style={{ fontSize: '0.85rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: searchedComplaint.serviceRecord.paymentStatus === 'Pending' ? '#fef08a' : '#bbf7d0', color: searchedComplaint.serviceRecord.paymentStatus === 'Pending' ? '#854d0e' : '#166534' }}>
                  {searchedComplaint.serviceRecord.paymentStatus}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <div><strong>Work Done:</strong> {searchedComplaint.serviceRecord.workDoneNotes || 'N/A'}</div>
                <div><strong>Total Amount:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>₹{searchedComplaint.serviceRecord.totalAmount}</span></div>
              </div>

              {onOpenInvoice && (
                <button 
                  onClick={() => onOpenInvoice(searchedComplaint)}
                  className="btn btn-primary btn-sm"
                >
                  <FileText size={16} /> View & Print Full Invoice
                </button>
              )}
            </div>
          )}

          {/* Event Logs Timeline */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
              Live Status Updates Log
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {searchedComplaint.timeline.map((evt) => (
                <div key={evt.id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem', borderLeft: '2px solid #cbd5e1', paddingLeft: '0.75rem', paddingTop: '0.2rem' }}>
                  <Clock size={16} style={{ color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{evt.title}</div>
                    <div style={{ color: '#475569' }}>{evt.description}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{evt.timestamp} • {evt.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .track-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
