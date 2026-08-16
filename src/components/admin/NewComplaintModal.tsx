import React, { useState } from 'react';
import type { Complaint, MachineType, ProblemType, BusinessSettings } from '../../types';
import { generateNextComplaintId, saveComplaint, addAuditLog } from '../../services/storage';
import { X } from 'lucide-react';

interface NewComplaintModalProps {
  settings: BusinessSettings;
  technicians?: any[];
  onClose: () => void;
  onSuccess: (complaint: Complaint) => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  settings,
  onClose,
  onSuccess
}) => {
  void settings;
  const [customerName, setCustomerName] = useState<string>('');
  const [customerMobile, setCustomerMobile] = useState<string>('');
  const [houseNo, setHouseNo] = useState<string>('');
  const [streetArea, setStreetArea] = useState<string>('');
  const [city, setCity] = useState<string>('Indore');
  const [pincode, setPincode] = useState<string>('452009');

  const [brand, setBrand] = useState<string>('LG');
  const [machineType, setMachineType] = useState<MachineType>('Fully Automatic Front Load');
  const [selectedProblem, setSelectedProblem] = useState<ProblemType>('Not Starting');

  const brandOptions = ['LG', 'Samsung', 'Whirlpool', 'IFB', 'Bosch', 'Haier', 'Godrej', 'Panasonic', 'Videocon', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerMobile.trim() || !houseNo.trim() || !streetArea.trim()) {
      alert('Please fill in required customer name, phone number, and address fields.');
      return;
    }

    const newId = generateNextComplaintId();

    const newComplaint: Complaint = {
      id: newId,
      customer: {
        name: customerName.trim(),
        mobile: customerMobile.trim(),
        whatsapp: customerMobile.trim(),
        whatsappSameAsMobile: true,
        houseNo: houseNo.trim(),
        streetArea: streetArea.trim(),
        city: city.trim(),
        pincode: pincode.trim()
      },
      machine: {
        brand,
        type: machineType,
        age: '1–3 years'
      },
      problem: {
        selectedProblems: [selectedProblem]
      },
      visit: {
        date: 'ASAP / Immediate',
        timeSlot: 'As soon as possible'
      },
      status: 'New Complaint',
      timeline: [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-US', { hour12: true }),
          status: 'New Complaint',
          title: 'Complaint Registered by Admin',
          description: `Booking recorded for customer ${customerName}.`,
          author: 'Admin'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveComplaint(newComplaint);
    addAuditLog('Admin', 'CREATE_COMPLAINT', `Admin created complaint ${newId} for ${customerName}`);

    onSuccess(newComplaint);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in" style={{ maxWidth: '640px', padding: 0 }}>

        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>+ Record New Service Request</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>

          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.75rem' }}>1. Customer & Address Details</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Customer Name *</label>
                <input type="text" required placeholder="Enter customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / Mobile Number *</label>
                <input type="tel" required placeholder="10-digit mobile number" value={customerMobile} onChange={(e) => setCustomerMobile(e.target.value)} className="form-input" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">House / Flat No *</label>
                <input type="text" required placeholder="Flat / House no." value={houseNo} onChange={(e) => setHouseNo(e.target.value)} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Street / Area *</label>
                <input type="text" required placeholder="Street / Area name" value={streetArea} onChange={(e) => setStreetArea(e.target.value)} className="form-input" />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Pincode</label>
                <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '0.75rem' }}>2. Machine & Problem</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="form-select">
                  {brandOptions.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select value={machineType} onChange={(e) => setMachineType(e.target.value as MachineType)} className="form-select">
                  <option value="Fully Automatic Front Load">Front Load</option>
                  <option value="Fully Automatic Top Load">Top Load</option>
                  <option value="Semi Automatic">Semi Automatic</option>
                  <option value="Washer Dryer">Washer Dryer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Primary Problem</label>
                <select value={selectedProblem} onChange={(e) => setSelectedProblem(e.target.value as ProblemType)} className="form-select">
                  <option value="Not Starting">Not Starting</option>
                  <option value="Not Draining Water">Not Draining Water</option>
                  <option value="Making Noise">Making Noise</option>
                  <option value="Not Spinning">Not Spinning</option>
                  <option value="Water Leakage">Water Leakage</option>
                  <option value="Error Code">Error Code</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-block">Cancel</button>
            <button type="submit" className="btn btn-primary btn-block">Save Complaint</button>
          </div>

        </form>

      </div>
    </div>
  );
};
