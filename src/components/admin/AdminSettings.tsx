import React, { useState } from 'react';
import type { BusinessSettings } from '../../types';
import { saveSettings, resetToDemoData } from '../../services/storage';
import { Save, RotateCcw, Building, Clock, Check, QrCode, Download, Printer } from 'lucide-react';

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
    if (window.confirm('Are you sure you want to reset all complaints to default demo data?')) {
      resetToDemoData();
      alert('System data reset to initial demo state!');
      window.location.reload();
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print QR Standee - Washing Machine Care</title>
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f8fafc;
            }
            .standee-card {
              width: 380px;
              padding: 40px 30px;
              background: #ffffff;
              border: 3px solid #0f172a;
              border-radius: 24px;
              text-align: center;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .logo { height: 50px; margin-bottom: 15px; }
            .title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 6px 0; }
            .subtitle { font-size: 14px; color: #2563eb; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
            .qr-frame { 
              padding: 16px; 
              background: #ffffff; 
              border: 2px solid #e2e8f0; 
              border-radius: 16px; 
              display: inline-block; 
              margin-bottom: 20px;
            }
            .qr-frame img { width: 240px; height: 240px; display: block; }
            .instruction { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
            .subtext { font-size: 13px; color: #64748b; margin-bottom: 20px; }
            .phone-badge { 
              background: #1e293b; 
              color: #ffffff; 
              padding: 12px 18px; 
              border-radius: 12px; 
              font-weight: 800; 
              font-size: 16px; 
            }
          </style>
        </head>
        <body>
          <div class="standee-card">
            <img src="/logo.png" class="logo" alt="Washing Machine Care" />
            <h1 class="title">Washing Machine Care</h1>
            <div class="subtitle">Doorstep Repair & Servicing</div>

            <div class="qr-frame">
              <img src="/website-qr.png" alt="Scan to Book Repair" />
            </div>

            <div class="instruction">📱 SCAN QR TO BOOK REPAIR</div>
            <div class="subtext">Scan with any Smartphone camera to book doorstep service & track complaints</div>

            <div class="phone-badge">
              📞 Helplines: +91 9926064529 | +91 9826247802
            </div>
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            System & Business Settings
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Configure shop profile, domain branding, QR code flyers, service time slots, and pincodes
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

      {/* Printable Website QR Standee Card */}
      <div className="card" style={{ borderLeft: '4px solid #2563eb', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <img src="/website-qr.png" alt="Website QR Code" style={{ width: '80px', height: '80px', display: 'block' }} />
          </div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
              <QrCode size={14} /> Printable Website QR Code
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              High-Resolution Print QR Standee
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Print standard A4/A5 shop counter standees or download 1000x1000 PNG for visiting cards & banners.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a 
            href="/website-qr.png" 
            download="washingmachinecare-qr.png"
            className="btn btn-secondary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Download size={16} /> Download QR PNG
          </a>
          <button 
            onClick={handlePrintQR}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Printer size={16} /> Print Mini Standee
          </button>
          <a 
            href="/poster.html?autoprint=true" 
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Printer size={16} /> Print Full A4 Poster 🖨️
          </a>
        </div>
      </div>

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
