import React, { useState } from 'react';
import type { Complaint, ComplaintStatus, BusinessSettings } from '../../types';
import { saveComplaint, addAuditLog, deleteComplaintLocal } from '../../services/storage';
import { deleteComplaintFromFirebase } from '../../services/firebase';
import { StatusBadge } from '../common/StatusBadge';
import { buildWhatsAppUrl, createCustomerWhatsAppMessage } from '../../utils/whatsapp';
import { 
  X, User, Wrench, MessageSquare, 
  FileText, Send, Trash2 
} from 'lucide-react';

interface ComplaintDetailModalProps {
  complaint: Complaint;
  technicians?: any[];
  settings: BusinessSettings;
  onClose: () => void;
  onOpenInvoice: (complaint: Complaint) => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  settings,
  onClose,
  onOpenInvoice
}) => {
  const [currentComplaint, setCurrentComplaint] = useState<Complaint>(complaint);
  const [internalNoteInput, setInternalNoteInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'charges'>('details');

  const availableStatuses: ComplaintStatus[] = [
    'New Complaint',
    'Contacted',
    'Inspection',
    'Repair In Progress',
    'Waiting for Parts',
    'Repair Completed',
    'Payment Pending',
    'Paid',
    'Cancelled'
  ];

  // Status Change Action
  const handleStatusChange = (status: ComplaintStatus) => {
    if (status === currentComplaint.status) return;

    const updatedTimeline = [
      ...currentComplaint.timeline,
      {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-US', { hour12: true }),
        status,
        title: `Status Changed to ${status}`,
        description: `Status updated from "${currentComplaint.status}" to "${status}".`,
        author: 'Admin'
      }
    ];

    const updated: Complaint = {
      ...currentComplaint,
      status,
      timeline: updatedTimeline,
      updatedAt: new Date().toISOString()
    };

    saveComplaint(updated);
    addAuditLog('Admin', 'UPDATE_STATUS', `Changed status of ${updated.id} to ${status}`);
    setCurrentComplaint(updated);
  };

  // Add Internal Timeline Note
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNoteInput.trim()) return;

    const updatedTimeline = [
      ...currentComplaint.timeline,
      {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-US', { hour12: true }),
        title: 'Internal Staff Note',
        description: internalNoteInput.trim(),
        author: 'Admin'
      }
    ];

    const updated: Complaint = {
      ...currentComplaint,
      timeline: updatedTimeline,
      internalNotes: [...(currentComplaint.internalNotes || []), internalNoteInput.trim()],
      updatedAt: new Date().toISOString()
    };

    saveComplaint(updated);
    setCurrentComplaint(updated);
    setInternalNoteInput('');
  };

  // Delete Complaint Action
  const handleDeleteComplaint = async () => {
    if (window.confirm(`Are you sure you want to permanently delete complaint ${currentComplaint.id}? It will be removed from all admin dashboards and customer tracking.`)) {
      await deleteComplaintFromFirebase(currentComplaint.id);
      deleteComplaintLocal(currentComplaint.id);
      addAuditLog('Admin', 'DELETE_COMPLAINT', `Deleted complaint ${currentComplaint.id}`);
      onClose();
    }
  };

  // WhatsApp click-to-chat links
  const customerWhatsAppLink = buildWhatsAppUrl(
    currentComplaint.customer.whatsapp || currentComplaint.customer.mobile,
    createCustomerWhatsAppMessage(currentComplaint, settings)
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '780px', padding: 0 }}>
        
        {/* Header Bar */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>{currentComplaint.id}</h2>
              <StatusBadge status={currentComplaint.status} />
            </div>
            <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
              Registered on {new Date(currentComplaint.createdAt).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => onOpenInvoice(currentComplaint)} className="btn btn-outline-primary btn-sm">
              <FileText size={16} /> View Invoice
            </button>

            <button 
              onClick={handleDeleteComplaint}
              className="btn btn-sm"
              style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Delete Complaint"
            >
              <Trash2 size={16} /> Delete
            </button>

            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '0 1.5rem' }}>
          <button 
            onClick={() => setActiveTab('details')}
            style={{ padding: '0.85rem 1.25rem', border: 'none', background: 'none', fontWeight: activeTab === 'details' ? 700 : 500, color: activeTab === 'details' ? '#1d4ed8' : '#64748b', borderBottom: activeTab === 'details' ? '2px solid #1d4ed8' : 'none', cursor: 'pointer' }}
          >
            Overview & Status
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            style={{ padding: '0.85rem 1.25rem', border: 'none', background: 'none', fontWeight: activeTab === 'timeline' ? 700 : 500, color: activeTab === 'timeline' ? '#1d4ed8' : '#64748b', borderBottom: activeTab === 'timeline' ? '2px solid #1d4ed8' : 'none', cursor: 'pointer' }}
          >
            Notes & Timeline ({currentComplaint.timeline.length})
          </button>
          <button 
            onClick={() => setActiveTab('charges')}
            style={{ padding: '0.85rem 1.25rem', border: 'none', background: 'none', fontWeight: activeTab === 'charges' ? 700 : 500, color: activeTab === 'charges' ? '#1d4ed8' : '#64748b', borderBottom: activeTab === 'charges' ? '2px solid #1d4ed8' : 'none', cursor: 'pointer' }}
          >
            Service Invoice & Billing
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
          
          {/* TAB 1: DETAILS & STATUS */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Quick Actions Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#eff6ff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                
                {/* Status Transition Selector */}
                <div>
                  <label className="form-label" style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700 }}>
                    Update Complaint Status
                  </label>
                  <select 
                    value={currentComplaint.status} 
                    onChange={(e) => handleStatusChange(e.target.value as ComplaintStatus)}
                    className="form-select"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  >
                    {availableStatuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Direct WhatsApp Contact Button */}
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <a href={customerWhatsAppLink} target="_blank" rel="noreferrer" className="btn btn-success btn-block" style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={16} /> Contact Customer on WhatsApp
                  </a>
                </div>

              </div>

              {/* Customer & Machine Info Grid */}
              <div className="grid-2">
                
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} style={{ color: '#1d4ed8' }} /> Customer Information
                  </h3>
                  <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#334155' }}>
                    <div><strong>Name:</strong> {currentComplaint.customer.name}</div>
                    <div><strong>Phone / Mobile:</strong> <a href={`tel:${currentComplaint.customer.mobile}`} style={{ color: '#1d4ed8', fontWeight: 700 }}>{currentComplaint.customer.mobile}</a></div>
                    <div style={{ marginTop: '0.35rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.35rem' }}>
                      <strong>Service Address:</strong><br />
                      {currentComplaint.customer.houseNo}, {currentComplaint.customer.streetArea}<br />
                      {currentComplaint.customer.landmark ? `Landmark: ${currentComplaint.customer.landmark}, ` : ''}{currentComplaint.customer.city} - {currentComplaint.customer.pincode}
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', backgroundColor: '#ffffff' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Wrench size={16} style={{ color: '#1d4ed8' }} /> Machine & Problem
                  </h3>
                  <div style={{ fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#334155' }}>
                    <div><strong>Brand:</strong> {currentComplaint.machine.brand}</div>
                    <div><strong>Type:</strong> {currentComplaint.machine.type}</div>
                    <div><strong>Age:</strong> {currentComplaint.machine.age}</div>
                    <div style={{ marginTop: '0.35rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.35rem' }}>
                      <strong>Reported Problem(s):</strong><br />
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>{currentComplaint.problem.selectedProblems.join(', ')}</span>
                    </div>
                    {currentComplaint.problem.errorCode && (
                      <div><strong>Error Code:</strong> <span style={{ backgroundColor: '#fef08a', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>{currentComplaint.problem.errorCode}</span></div>
                    )}
                    {currentComplaint.problem.additionalDetails && (
                      <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.85rem' }}>"{currentComplaint.problem.additionalDetails}"</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: TIMELINE & INTERNAL NOTES */}
          {activeTab === 'timeline' && (
            <div>
              {/* Add Note Input Form */}
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Add internal note or customer phone update..." 
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  className="form-input"
                  style={{ margin: 0 }}
                />
                <button type="submit" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
                  <Send size={16} /> Add Note
                </button>
              </form>

              {/* Timeline Events List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {currentComplaint.timeline.map((evt) => (
                  <div key={evt.id} style={{ borderLeft: '3px solid #1d4ed8', paddingLeft: '1rem', backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{evt.title}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{evt.timestamp}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>{evt.description}</p>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.35rem' }}>Author: {evt.author}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: BILLING / INVOICE */}
          {activeTab === 'charges' && (
            <div>
              <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Service Labor & Parts Invoice</h3>
                
                {currentComplaint.serviceRecord ? (
                  <>
                    <div className="grid-2" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                      <div><strong>Inspection Notes:</strong> {currentComplaint.serviceRecord.inspectionNotes || 'N/A'}</div>
                      <div><strong>Work Performed:</strong> {currentComplaint.serviceRecord.workDoneNotes || 'N/A'}</div>
                    </div>

                    <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <strong>Parts Replaced:</strong>
                      {currentComplaint.serviceRecord.partsUsed.length > 0 ? (
                        <ul>
                          {currentComplaint.serviceRecord.partsUsed.map(p => (
                            <li key={p.id}>{p.name} × {p.quantity} = ₹{p.quantity * p.cost}</li>
                          ))}
                        </ul>
                      ) : (
                        <span> No spare parts added.</span>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '0.75rem', fontSize: '1rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Amount:</span>
                      <span style={{ color: '#1d4ed8', fontSize: '1.2rem' }}>₹{currentComplaint.serviceRecord.totalAmount}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.9rem', color: '#64748b' }}>No custom line items recorded yet. Standard service invoice will be generated.</p>
                )}

                <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => onOpenInvoice(currentComplaint)} className="btn btn-primary btn-block">
                    <FileText size={18} /> Open Printable Invoice
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
