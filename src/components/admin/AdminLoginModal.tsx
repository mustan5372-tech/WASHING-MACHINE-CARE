import React, { useState } from 'react';
import { Shield, AlertCircle, Eye, EyeOff, Phone, UserCheck } from 'lucide-react';
import type { UserSession } from '../../types';
import { authenticateAdminAccount } from '../../services/accounts';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: UserSession) => void;
  targetRole: 'admin' | 'staff';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  targetRole
}) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const session = authenticateAdminAccount(mobile, password);
    
    if (session) {
      onSuccess(session);
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Invalid Mobile Number or Password. Access denied.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Header Banner */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1.75rem 1.5rem',
          textAlign: 'center',
          position: 'relative',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(37, 99, 235, 0.15)',
            border: '2px solid #3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.85rem auto',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
          }}>
            <Shield size={30} style={{ color: '#60a5fa' }} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
            {targetRole === 'admin' ? 'Admin Gateway Authentication' : 'Staff Portal Login'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.35rem 0 0 0' }}>
            Enter your registered admin mobile number & password
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '0.75rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem',
              fontWeight: 600
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Mobile Number Field */}
          <div style={{ marginBottom: '1.15rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Registered Mobile Number
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="tel"
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                autoComplete="off"
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0f172a'
                }}
              />
              <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                required
                style={{
                  width: '100%',
                  padding: '0.7rem 2.5rem 0.7rem 0.85rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: '#0f172a'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1.5,
                padding: '0.75rem',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)'
              }}
            >
              <UserCheck size={18} /> Log In as Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
