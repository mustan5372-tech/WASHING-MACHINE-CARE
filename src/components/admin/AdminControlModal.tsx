import React, { useState } from 'react';
import { X, UserPlus, Trash2, Key, Crown, UserCheck } from 'lucide-react';
import { 
  getAdminAccounts, 
  addAdminAccount, 
  deleteAdminAccount, 
  updateAdminAccountDetails, 
  normalizeMobile,
  type AdminAccount 
} from '../../services/accounts';

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserMobile?: string;
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({ isOpen, onClose }) => {
  const [accounts, setAccounts] = useState<AdminAccount[]>(getAdminAccounts());
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

  // New account form state
  const [newName, setNewName] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff'>('admin');

  // Edit inline state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [msg, setMsg] = useState('');

  if (!isOpen) return null;

  const refreshAccountsList = () => {
    setAccounts(getAdminAccounts());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newMobile || !newPassword) return;

    addAdminAccount({
      name: newName.trim(),
      mobile: newMobile.trim(),
      password: newPassword.trim(),
      role: newRole
    });

    setMsg(`Account created for ${newName}!`);
    refreshAccountsList();
    setNewName('');
    setNewMobile('');
    setNewPassword('');
    setActiveTab('list');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDelete = (id: string, name: string, mobile: string) => {
    if (normalizeMobile(mobile) === '9238728746') {
      alert('⚠️ Super Admin account (9238728746) cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete admin account ${name} (${mobile})?`)) {
      const ok = deleteAdminAccount(id);
      if (ok) {
        setMsg(`Account ${name} deleted successfully.`);
        refreshAccountsList();
        setTimeout(() => setMsg(''), 3000);
      } else {
        alert('Failed to delete account.');
      }
    }
  };

  const handleToggleRole = (acc: AdminAccount) => {
    if (normalizeMobile(acc.mobile) === '9238728746') {
      alert('👑 Mustansir Sanawadwala (9238728746) is the permanent Super Admin.');
      return;
    }
    const nextRole = acc.role === 'admin' ? 'staff' : 'admin';
    updateAdminAccountDetails(acc.id, { role: nextRole });
    setMsg(`Updated ${acc.name}'s role to ${nextRole.toUpperCase()}`);
    refreshAccountsList();
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSavePassword = (id: string) => {
    if (!editPassword.trim()) return;
    updateAdminAccountDetails(id, { password: editPassword.trim() });
    setMsg(`Password updated successfully!`);
    setEditingId(null);
    setEditPassword('');
    refreshAccountsList();
    setTimeout(() => setMsg(''), 3000);
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
        borderRadius: '24px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #cbd5e1'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Crown size={24} style={{ color: '#f59e0b' }} />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#ffffff' }}>
                Super Admin Account Control Panel 👑
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                Master Authority over all Admins & Staff (Super Admin: 9238728746)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 1.5rem', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              backgroundColor: activeTab === 'list' ? '#2563eb' : 'transparent',
              color: activeTab === 'list' ? '#ffffff' : '#64748b'
            }}
          >
            All Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: activeTab === 'add' ? '#2563eb' : 'transparent',
              color: activeTab === 'add' ? '#ffffff' : '#64748b'
            }}
          >
            <UserPlus size={16} /> + Register New Admin
          </button>
        </div>

        {/* Feedback Message */}
        {msg && (
          <div style={{ backgroundColor: '#f0fdf4', borderBottom: '1px solid #86efac', color: '#166534', padding: '0.75rem 1.5rem', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
            ✅ {msg}
          </div>
        )}

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {accounts.map(acc => {
                const isSuper = normalizeMobile(acc.mobile) === '9238728746';
                return (
                  <div 
                    key={acc.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: '16px',
                      backgroundColor: isSuper ? '#fffbeb' : '#f8fafc',
                      border: isSuper ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        {isSuper ? (
                          <Crown size={22} style={{ color: '#d97706' }} />
                        ) : (
                          <UserCheck size={20} style={{ color: '#2563eb' }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>
                            {acc.name}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>
                            📱 Mobile: {acc.mobile} {acc.email ? `| ✉️ ${acc.email}` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          textTransform: 'uppercase',
                          backgroundColor: isSuper ? '#fef3c7' : acc.role === 'admin' ? '#dbeafe' : '#f3f4f6',
                          color: isSuper ? '#b45309' : acc.role === 'admin' ? '#1e40af' : '#4b5563',
                          border: isSuper ? '1px solid #fcd34d' : acc.role === 'admin' ? '1px solid #93c5fd' : '1px solid #d1d5db'
                        }}>
                          {isSuper ? '👑 SUPER ADMIN' : acc.role.toUpperCase()}
                        </span>

                        {!isSuper && (
                          <button
                            onClick={() => handleToggleRole(acc)}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700 }}
                            title="Toggle Admin / Staff Role"
                          >
                            Switch Role
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Account Controls & Password Editing */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Key size={14} style={{ color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700 }}>Password:</span> 
                        <code style={{ backgroundColor: '#e2e8f0', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>{acc.password}</code>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {editingId === acc.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                            <input 
                              type="text"
                              placeholder="New password"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px', border: '1px solid #3b82f6' }}
                            />
                            <button onClick={() => handleSavePassword(acc.id)} className="btn btn-sm btn-primary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                              Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="btn btn-sm btn-secondary" style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingId(acc.id);
                              setEditPassword(acc.password);
                            }}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            Change Password
                          </button>
                        )}

                        {!isSuper && (
                          <button
                            onClick={() => handleDelete(acc.id, acc.name, acc.mobile)}
                            className="btn btn-sm"
                            style={{ backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.4rem', borderRadius: '6px' }}
                            title="Delete Admin Account"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Full Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Technician Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Mobile Number (Login ID)
                </label>
                <input 
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={newMobile}
                  onChange={(e) => setNewMobile(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Assign Password
                </label>
                <input 
                  type="text"
                  placeholder="Secure Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                  Role Level
                </label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'staff')}
                  className="form-select"
                  style={{ fontWeight: 700 }}
                >
                  <option value="admin">Full Admin (Complaints, Reports & Settings)</option>
                  <option value="staff">Service Staff (Complaints & Repair Only)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setActiveTab('list')} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.5, fontWeight: 800 }}>
                  Create Admin Account
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
