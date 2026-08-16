import React, { useState } from 'react';
import type { BusinessSettings } from '../../types';
import { saveSettings, resetToDemoData } from '../../services/storage';
import { Save, RotateCcw, Building, Clock, Check } from 'lucide-react';

interface AdminSettingsProps {
  settings: BusinessSettings;
  onUpdateSettings: (settings: BusinessSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(formData);
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all complaints and technicians to default demo data?')) {
      resetToDemoData();
      alert('System data reset to initial demo state!');
      window.location.reload();
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            System & Business Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Configure shop profile, domain branding, service time slots, and pincodes
          </p>
        </div>

        <button onClick={handleResetData} className="btn btn-secondary btn-sm" style={{ border: '1px solid #fca5a5', color: '#dc2626' }}>
          <RotateCcw size={16} /> Reset Demo Data
        </button>
      </div>

      {savedSuccess && (
        <div style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', padding: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Check size={18} /> Settings updated and saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Business Information Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} /> Business Profile & Branding
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input 
                type="text" 
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website Domain</label>
              <input 
                type="text" 
                value={formData.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                className="form-input"
                style={{ fontWeight: 700, color: '#1d4ed8' }}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Helpline Phone Number</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Business Number</label>
              <input 
                type="tel" 
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Service Workshop Address</label>
            <input 
              type="text" 
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Working Hours</label>
            <input 
              type="text" 
              value={formData.workingHours}
              onChange={(e) => setFormData(prev => ({ ...prev, workingHours: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>

        {/* Complaint Prefix & Time Slots */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d4ed8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} /> Complaint & Schedule Configuration
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Complaint Number Prefix</label>
              <input 
                type="text" 
                value={formData.complaintPrefix}
                onChange={(e) => setFormData(prev => ({ ...prev, complaintPrefix: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available Time Slots (comma separated)</label>
              <input 
                type="text" 
                value={formData.timeSlots.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, timeSlots: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg" style={{ minWidth: '220px' }}>
            <Save size={18} /> Save Settings
          </button>
        </div>

      </form>

    </div>
  );
};
