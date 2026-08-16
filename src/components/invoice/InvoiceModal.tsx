import React from 'react';
import type { Complaint, BusinessSettings } from '../../types';
import { Wrench, Printer, Share2, X, ShieldCheck } from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

interface InvoiceModalProps {
  complaint: Complaint;
  settings: BusinessSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ complaint, settings, onClose }) => {
  const serviceRecord = complaint.serviceRecord || {
    inspectionNotes: 'Diagnostic inspection conducted.',
    workDoneNotes: 'Standard washing machine repair & servicing.',
    partsUsed: [],
    serviceCharge: 400,
    partsCharge: 0,
    otherCharge: 0,
    discount: 0,
    totalAmount: 400,
    paymentStatus: 'Pending',
    beforePhotos: [],
    afterPhotos: []
  };

  const handlePrint = () => {
    window.print();
  };

  const shareWhatsAppInvoice = () => {
    const message = `Hello ${complaint.customer.name},

Here is your service invoice from *${settings.businessName}*:

📋 *INVOICE DETAILS*
• Complaint ID: *${complaint.id}*
• Machine: ${complaint.machine.brand} (${complaint.machine.type})
• Service Date: ${complaint.visit.date}
• Work Done: ${serviceRecord.workDoneNotes || 'Repair Service'}
• Grand Total: *₹${serviceRecord.totalAmount}*
• Payment Status: *${serviceRecord.paymentStatus}*

Thank you for choosing ${settings.businessName}!
Warranty: 30-Day Service Warranty Applied.`;

    const url = buildWhatsAppUrl(complaint.customer.whatsapp || complaint.customer.mobile, message);
    window.open(url, '_blank');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '780px', padding: 0 }}>
        
        {/* Header bar (Hidden when printing) */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={18} style={{ color: '#1d4ed8' }} /> Service Invoice — {complaint.id}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={16} /> Print / Save PDF
            </button>
            <button onClick={shareWhatsAppInvoice} className="btn btn-success btn-sm">
              <Share2 size={16} /> Share on WhatsApp
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.3rem' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div style={{ padding: '2rem 2.5rem', backgroundColor: '#ffffff', color: '#0f172a' }} id="invoice-document">
          
          {/* Top Header & Business Details */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', borderBottom: '2px solid #1d4ed8', paddingBottom: '1.5rem', marginBottom: '1.5rem', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <img 
                  src="/logo.png" 
                  alt="Washing Machine Care Logo" 
                  style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
                />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{settings.businessName}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                <div>{settings.address}</div>
                <div>Phone: {settings.phone} | Email: {settings.email}</div>
                <div style={{ fontWeight: 700, color: '#2563eb' }}>{settings.domain}</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1d4ed8', letterSpacing: '0.05em' }}>
                SERVICE INVOICE
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {complaint.id}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Date: {new Date(complaint.createdAt).toLocaleDateString()}
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <span 
                  style={{ 
                    padding: '0.25rem 0.85rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem', 
                    fontWeight: 800, 
                    backgroundColor: serviceRecord.paymentStatus === 'Pending' ? '#fef08a' : '#bbf7d0',
                    color: serviceRecord.paymentStatus === 'Pending' ? '#854d0e' : '#166534',
                    border: '1px solid currentColor'
                  }}
                >
                  STAMP: {serviceRecord.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Machine Info Columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>CUSTOMER DETAILS</div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{complaint.customer.name}</div>
              <div style={{ color: '#475569' }}>Phone: {complaint.customer.mobile}</div>
              <div style={{ color: '#475569' }}>Address: {complaint.customer.houseNo}, {complaint.customer.streetArea}, {complaint.customer.city} - {complaint.customer.pincode}</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.35rem' }}>APPLIANCE & SERVICE</div>
              <div><strong>Brand & Model:</strong> {complaint.machine.brand} ({complaint.machine.type})</div>
              <div><strong>Reported Problem:</strong> {complaint.problem.selectedProblems.join(', ')}</div>
              <div><strong>Serviced By:</strong> Washing Machine Care Team</div>
              <div><strong>Service Date:</strong> {complaint.visit.date}</div>
            </div>
          </div>

          {/* Service Work Done Summary */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
              Diagnosis & Work Performed:
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.85rem', borderRadius: '8px', fontSize: '0.9rem', color: '#334155' }}>
              <div><strong>Inspection:</strong> {serviceRecord.inspectionNotes || 'Full operational inspection performed.'}</div>
              <div><strong>Work Done:</strong> {serviceRecord.workDoneNotes || 'Serviced drum assembly, electrical connections, and motor testing.'}</div>
            </div>
          </div>

          {/* Itemized Parts & Charges Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.75rem', color: '#334155' }}>Description / Part Name</th>
                <th style={{ padding: '0.65rem 0.75rem', textWrap: 'nowrap', textAlign: 'center', color: '#334155' }}>Qty</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#334155' }}>Unit Cost</th>
                <th style={{ padding: '0.65rem 0.75rem', textAlign: 'right', color: '#334155' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.65rem 0.75rem' }}>Door-step Diagnostic & Service Labor Charge</td>
                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>1</td>
                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>₹{serviceRecord.serviceCharge}</td>
                <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>₹{serviceRecord.serviceCharge}</td>
              </tr>

              {serviceRecord.partsUsed.map(part => (
                <tr key={part.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.65rem 0.75rem' }}>{part.name}</td>
                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>{part.quantity}</td>
                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>₹{part.cost}</td>
                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>₹{part.quantity * part.cost}</td>
                </tr>
              ))}

              {serviceRecord.otherCharge > 0 && (
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.65rem 0.75rem' }}>Transport / Miscellaneous Charge</td>
                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>₹{serviceRecord.otherCharge}</td>
                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>₹{serviceRecord.otherCharge}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Grand Totals Box */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ width: '280px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>Subtotal:</span>
                <span>₹{serviceRecord.serviceCharge + serviceRecord.partsCharge + serviceRecord.otherCharge}</span>
              </div>
              {serviceRecord.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid #e2e8f0', color: '#16a34a' }}>
                  <span>Discount:</span>
                  <span>- ₹{serviceRecord.discount}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', fontWeight: 900, fontSize: '1.25rem', color: '#1d4ed8', borderTop: '2px solid #0f172a' }}>
                <span>Grand Total:</span>
                <span>₹{serviceRecord.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Warranty & Footer Terms */}
          <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1.25rem', fontSize: '0.825rem', color: '#64748b', textAlign: 'center', lineHeight: '1.5' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: '#16a34a', marginBottom: '0.35rem' }}>
              <ShieldCheck size={16} /> 30-DAY SERVICE WARRANTY APPLIED
            </div>
            <div>
              Thank you for choosing <strong>{settings.businessName}</strong>. If any issue re-occurs within 30 days regarding the work performed, our technician will inspect and resolve it free of labor cost.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
