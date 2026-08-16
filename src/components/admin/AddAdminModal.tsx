import React, { useState } from 'react';
import { UserPlus, X, Phone, Lock, User, ShieldCheck } from 'lucide-react';
import { addAdminAccount } from '../../services/accounts';

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('admin');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !password) return;

    addAdminAccount({
      name: name.trim(),
      mobile: mobile.trim(),
      password: password.trim(),
      role
    });

    setSuccessMsg(`Admin account for ${name} created successfully! You can now log in using ${mobile}.`);
    setTimeout(() => {
      setSuccessMsg('');
      setName('');
      setMobile('');
      setPassword('');
      onClose();
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={20} style={{ color: '#60a5fa' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Register New Admin / Staff</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {successMsg ? (
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '1rem', borderRadius: '10px', fontSize: '0.9rem', textAlign: 'center', fontWeight: 700 }}>
              <ShieldCheck size={28} style={{ color: '#16a34a', margin: '0 auto 0.5rem auto' }} />
              {successMsg}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. Sunil Piple"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <User size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Mobile Number (Login ID)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="tel" 
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Phone size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    placeholder="Assign secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Account Role
                </label>
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value as 'admin' | 'staff')}
                  className="form-select"
                  style={{ fontWeight: 700 }}
                >
                  <option value="admin">Full Shop Admin (Access All Controls & Financials)</option>
                  <option value="staff">Service Staff (Service & Complaints Control)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5, fontWeight: 800 }}>
                  Save Account
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
