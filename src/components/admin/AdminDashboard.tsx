import React, { useState, useEffect } from 'react';
import type { Complaint, BusinessSettings } from '../../types';
import { exportComplaintsToCsv } from '../../utils/exportCsv';
import { StatusBadge } from '../common/StatusBadge';
import { AddAdminModal } from './AddAdminModal';
import { 
  AlertCircle, Wrench, CheckCircle2, Clock, 
  Plus, Search, Download, UserPlus, Trash2, Bell 
} from 'lucide-react';
import { deleteComplaintFromFirebase, registerFcmNotifications } from '../../services/firebase';
import { deleteComplaintLocal, addAuditLog } from '../../services/storage';

interface AdminDashboardProps {
  complaints: Complaint[];
  technicians?: any[];
  settings: BusinessSettings;
  onOpenComplaintDetail: (complaint: Complaint) => void;
  onOpenNewComplaintModal: () => void;
  onNavigate: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  complaints,
  settings,
  onOpenComplaintDetail,
  onOpenNewComplaintModal
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAddAdminOpen, setIsAddAdminOpen] = useState<boolean>(false);
  const [notifState, setNotifState] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifState(Notification.permission);
      if (Notification.permission === 'granted') {
        registerFcmNotifications('Admin');
      }
    }
  }, []);

  const handleRequestNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifState(permission);
      if (permission === 'granted') {
        await registerFcmNotifications('Admin');
        alert('✅ Firebase Cloud Messaging (FCM) Enabled! You will receive instant background push alerts when a customer books a washing machine repair.');
      } else if (permission === 'denied') {
        alert('⚠️ Notifications blocked in your browser settings. Please allow notifications in your browser site settings.');
      }
    } else {
      alert('Browser does not support desktop push notifications.');
    }
  };

  // Calculate Metrics
  const newCount = complaints.filter(c => c.status === 'New Complaint').length;
  const inProgressCount = complaints.filter(c => c.status === 'Inspection' || c.status === 'Repair In Progress' || c.status === 'Waiting for Parts' || c.status === 'Contacted').length;
  const completedCount = complaints.filter(c => c.status === 'Repair Completed' || c.status === 'Paid').length;
  const paymentPendingCount = complaints.filter(c => c.status === 'Payment Pending' || (c.serviceRecord && c.serviceRecord.paymentStatus === 'Pending')).length;

  // Filtered Complaints List
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer.mobile.includes(searchTerm) ||
      c.customer.streetArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.machine.brand.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteComplaint = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete complaint ${id}? It will be permanently removed from all admin screens and customer tracking.`)) {
      await deleteComplaintFromFirebase(id);
      deleteComplaintLocal(id);
      addAuditLog('Admin', 'DELETE_COMPLAINT', `Deleted complaint ${id}`);
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
            onClick={handleRequestNotification}
            className="btn btn-secondary btn-sm"
            style={{ 
              backgroundColor: notifState === 'granted' ? '#f0fdf4' : '#eff6ff', 
              color: notifState === 'granted' ? '#15803d' : '#1d4ed8', 
              border: `1px solid ${notifState === 'granted' ? '#86efac' : '#bfdbfe'}`,
              fontWeight: 700
            }}
          >
            <Bell size={16} /> {notifState === 'granted' ? 'Notifications Active 🔔' : 'Enable Push Notifications 🔔'}
          </button>

          <button onClick={onOpenNewComplaintModal} className="btn btn-primary" style={{ backgroundColor: '#1d4ed8' }}>
            <Plus size={18} /> + New Complaint
          </button>

          <button onClick={() => setIsAddAdminOpen(true)} className="btn btn-secondary" style={{ border: '1px solid #cbd5e1' }}>
            <UserPlus size={18} /> Add Admin
          </button>

          <button onClick={() => exportComplaintsToCsv(complaints)} className="btn btn-secondary" style={{ border: '1px solid #cbd5e1' }}>
            <Download size={18} /> Export CSV
          </button>
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

      {/* Filter & Search Bar */}
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

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
          </div>

        </div>
      </div>

      {/* Complaints Table */}
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
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    No complaints found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredComplaints.map(c => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal 
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
      />

      {/* Hover effects */}
      <style>{`
        .table-row-hover:hover {
          background-color: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};
