import React, { useState } from 'react';
import type { Complaint, BusinessSettings, UserSession } from '../../types';
import { exportComplaintsToCsv } from '../../utils/exportCsv';
import { StatusBadge } from '../common/StatusBadge';
import { AddAdminModal } from './AddAdminModal';
import { AdminControlModal } from './AdminControlModal';
import { 
  AlertCircle, Wrench, CheckCircle2, Clock, 
  Plus, Search, Download, UserPlus, Trash2, Volume2,
  LayoutGrid, List, Phone, MapPin, Calendar, RotateCw, Crown
} from 'lucide-react';
import { deleteComplaintFromFirebase, deleteAllComplaintsFromFirebase, playLoudInWebsiteBeep } from '../../services/firebase';
import { deleteComplaintLocal, purgeAllComplaintsLocal, addAuditLog } from '../../services/storage';

interface AdminDashboardProps {
  complaints: Complaint[];
  technicians?: any[];
  settings: BusinessSettings;
  session?: UserSession;
  onOpenComplaintDetail: (complaint: Complaint) => void;
  onOpenNewComplaintModal: () => void;
  onNavigate: (tab: string) => void;
  onDeleteComplaint?: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  settings,
  session,
  onOpenComplaintDetail,
  onOpenNewComplaintModal,
  onDeleteComplaint
}) => {
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddAdminOpen, setIsAddAdminOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('wmc_admin_view_mode') as 'grid' | 'table') || 'grid';
  });

  const handleToggleViewMode = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('wmc_admin_view_mode', mode);
  };

  const handleTestLoudBeep = () => {
    playLoudInWebsiteBeep();
    alert('🔊 Loud Beep Audio Chime Triggered!');
  };

  const handlePurgeAllComplaints = async () => {
    if (window.confirm('⚠️ ARE YOU SURE YOU WANT TO PERMANENTLY DELETE ALL TEST COMPLAINTS?\n\nThis will wipe all existing test complaints from cloud database and local cache. This action CANNOT be undone!')) {
      purgeAllComplaintsLocal();
      await deleteAllComplaintsFromFirebase();
      addAuditLog('Admin', 'PURGE_ALL_COMPLAINTS', 'Permanently wiped all test complaints');
      alert('✅ All test complaints have been permanently deleted from cloud & local storage.');
      window.location.reload();
    }
  };

  // Calculate Metrics
  const newCount = complaints.filter(c => c.status === 'New Complaint').length;
  const inProgressCount = complaints.filter(c => c.status === 'Inspection' || c.status === 'Repair In Progress' || c.status === 'Waiting for Parts' || c.status === 'Contacted').length;
  const completedCount = complaints.filter(c => c.status === 'Repair Completed' || c.status === 'Paid').length;
  const paymentPendingCount = complaints.filter(c => c.status === 'Payment Pending' || (c.serviceRecord && c.serviceRecord.paymentStatus === 'Pending')).length;

  // Filtered Complaints List
  const filteredComplaints = complaints.filter(c => {
    if (!c || !c.id) return false;
    const matchesSearch = 
      (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customer?.mobile || '').includes(searchTerm) ||
      (c.customer?.streetArea || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.machine?.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteComplaint = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete complaint ${id}? It will be permanently removed from all admin screens and customer tracking.`)) {
      deleteComplaintLocal(id);
      await deleteComplaintFromFirebase(id);
      addAuditLog('Admin', 'DELETE_COMPLAINT', `Deleted complaint ${id}`);
      if (onDeleteComplaint) {
        onDeleteComplaint(id);
      }
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Header & Quick Actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
            Shop Admin Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Washing Machine Care Service Management System ({settings.domain})
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700 }}
            title="Auto-refresh active (auto-syncing continuously every 10s). Click to force instant reload."
          >
            <RotateCw size={15} /> Auto-Sync Active (10s) 🔄
          </button>

          <button 
            onClick={handleTestLoudBeep}
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', fontWeight: 700 }}
            title="Test Loud In-Website Audio Chime Beep"
          >
            <Volume2 size={16} /> Test Loud Beep Alert 🔊
          </button>

          <button onClick={onOpenNewComplaintModal} className="btn btn-primary" style={{ backgroundColor: '#1d4ed8' }}>
            <Plus size={18} /> + New Complaint
          </button>

          {session?.role === 'super_admin' || (session?.email && session.email.includes('9238728746')) ? (
            <button 
              onClick={() => setIsControlModalOpen(true)} 
              className="btn btn-primary" 
              style={{ backgroundColor: '#d97706', color: '#ffffff', fontWeight: 800, border: '1px solid #b45309', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              title="Super Admin Control Panel (Manage Admins, Passwords, Roles)"
            >
              <Crown size={18} /> 👑 Admin Control Panel
            </button>
          ) : (
            <button onClick={() => setIsAddAdminOpen(true)} className="btn btn-secondary" style={{ border: '1px solid #cbd5e1' }}>
              <UserPlus size={18} /> Add Admin
            </button>
          )}

          <button onClick={() => exportComplaintsToCsv(complaints)} className="btn btn-secondary" style={{ border: '1px solid #cbd5e1' }}>
            <Download size={18} /> Export CSV
          </button>

          {complaints.length > 0 && (
            <button 
              onClick={handlePurgeAllComplaints} 
              className="btn btn-secondary" 
              style={{ border: '1px solid #fca5a5', color: '#dc2626', backgroundColor: '#fef2f2', fontWeight: 700 }}
              title="Delete all test complaints from database"
            >
              <Trash2 size={16} /> Wipe Test Complaints
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-4">
        <div 
          onClick={() => setStatusFilter('New Complaint')}
          className="card" 
          style={{ cursor: 'pointer', borderLeft: '4px solid #ef4444', backgroundColor: statusFilter === 'New Complaint' ? '#fef2f2' : '#ffffff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>New Complaints</span>
            <AlertCircle size={20} style={{ color: '#ef4444' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{newCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Repair In Progress')}
          className="card" 
          style={{ cursor: 'pointer', borderLeft: '4px solid #3b82f6', backgroundColor: statusFilter === 'Repair In Progress' ? '#eff6ff' : '#ffffff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>In Repair</span>
            <Wrench size={20} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{inProgressCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Repair Completed')}
          className="card" 
          style={{ cursor: 'pointer', borderLeft: '4px solid #10b981', backgroundColor: statusFilter === 'Repair Completed' ? '#f0fdf4' : '#ffffff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>Completed</span>
            <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{completedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('Payment Pending')}
          className="card" 
          style={{ cursor: 'pointer', borderLeft: '4px solid #f59e0b', backgroundColor: statusFilter === 'Payment Pending' ? '#fffbeb' : '#ffffff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>Payment Pending</span>
            <Clock size={20} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>{paymentPendingCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar + View Toggle */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Complaint ID, Customer Name, Phone, Brand..."
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {['ALL', 'New Complaint', 'Inspection', 'Repair In Progress', 'Repair Completed', 'Paid'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.8rem' }}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}

            {/* Layout Toggle (Cards vs Table) */}
            <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1', marginLeft: '0.25rem' }}>
              <button
                onClick={() => handleToggleViewMode('grid')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? '#1d4ed8' : '#64748b',
                  fontWeight: viewMode === 'grid' ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Cards View Layout"
              >
                <LayoutGrid size={15} /> Cards
              </button>

              <button
                onClick={() => handleToggleViewMode('table')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#1d4ed8' : '#64748b',
                  fontWeight: viewMode === 'table' ? 700 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
                title="Table View Layout"
              >
                <List size={15} /> Table
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Complaints Display Area */}
      {filteredComplaints.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          No complaints found matching criteria.
        </div>
      ) : viewMode === 'grid' ? (
        /* CARD VIEW LAYOUT */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredComplaints.map(c => (
            <div 
              key={c.id}
              onClick={() => onOpenComplaintDetail(c)}
              className="card complaint-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                borderLeft: c.status === 'New Complaint' ? '5px solid #ef4444' : c.status === 'Repair Completed' ? '5px solid #10b981' : '5px solid #3b82f6',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                gap: '1rem'
              }}
            >
              {/* Card Header: ID & Status */}
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>{c.id}</span>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                      <Calendar size={12} /> {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                {/* Customer Details */}
                <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{c.customer.name}</div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontWeight: 700, fontSize: '0.875rem', margin: '0.25rem 0' }}>
                    <Phone size={14} /> {c.customer.mobile}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                    <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: '#94a3b8' }} />
                    <span>{c.customer.streetArea}{c.customer.city ? `, ${c.customer.city}` : ''}</span>
                  </div>
                </div>

                {/* Machine & Problem info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b' }}>
                    🧺 {c.machine.brand} <span style={{ fontWeight: 500, color: '#64748b', fontSize: '0.8rem' }}>({c.machine.type})</span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#dc2626', fontWeight: 700, backgroundColor: '#fef2f2', padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #fecaca', display: 'inline-block' }}>
                    ⚠️ {c.problem.selectedProblems.join(', ')}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Phone Call + WhatsApp + View + Delete */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <a 
                    href={`tel:${c.customer.mobile}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-sm"
                    style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700, padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', textDecoration: 'none' }}
                  >
                    📞 Call
                  </a>
                  <a 
                    href={`https://wa.me/91${c.customer.mobile.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="btn btn-sm"
                    style={{ backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac', fontWeight: 700, padding: '0.4rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', textDecoration: 'none' }}
                  >
                    💬 WhatsApp
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenComplaintDetail(c);
                    }}
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.75rem' }}
                  >
                    Details
                  </button>

                  <button 
                    onClick={(e) => handleDeleteComplaint(e, c.id)}
                    className="btn btn-sm"
                    title="Delete Complaint"
                    style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '0.45rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW LAYOUT */
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>ID / Date</th>
                  <th style={{ padding: '1rem' }}>Customer Info</th>
                  <th style={{ padding: '1rem' }}>Machine Details</th>
                  <th style={{ padding: '1rem' }}>Issue Description</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr 
                    key={c.id}
                    onClick={() => onOpenComplaintDetail(c)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{c.id}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.customer.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>{c.customer.mobile}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.customer.streetArea}</div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.machine.brand}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.machine.type}</div>
                    </td>

                    <td style={{ padding: '1rem', maxWidth: '240px' }}>
                      <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600 }}>
                        {c.problem.selectedProblems.join(', ')}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={c.status} />
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenComplaintDetail(c);
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          View & Edit
                        </button>
                        <button 
                          onClick={(e) => handleDeleteComplaint(e, c.id)}
                          className="btn btn-sm btn-secondary"
                          title="Delete Complaint"
                          style={{ color: '#dc2626', padding: '0.4rem 0.5rem', border: '1px solid #fca5a5' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      <AddAdminModal 
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
      />

      {/* Super Admin Control Modal */}
      <AdminControlModal
        isOpen={isControlModalOpen}
        onClose={() => setIsControlModalOpen(false)}
        currentUserMobile={session?.email}
      />

      {/* Hover effects */}
      <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
        .complaint-card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
};

