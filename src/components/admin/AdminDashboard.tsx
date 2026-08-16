import React, { useState } from 'react';
import type { Complaint, BusinessSettings } from '../../types';
import { exportComplaintsToCsv } from '../../utils/exportCsv';
import { StatusBadge } from '../common/StatusBadge';
import { 
  AlertCircle, Wrench, CheckCircle2, Clock, 
  Plus, Search, Download, UserCheck 
} from 'lucide-react';

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
  onOpenNewComplaintModal,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
          <button onClick={onOpenNewComplaintModal} className="btn btn-primary" style={{ backgroundColor: '#1d4ed8' }}>
            <Plus size={18} /> + New Complaint
          </button>

          <button onClick={() => onNavigate('admin-complaints')} className="btn btn-secondary">
            <UserCheck size={18} /> View All Complaints
          </button>

          <button onClick={() => exportComplaintsToCsv(complaints)} className="btn btn-secondary">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY CARDS */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          SHOP SERVICE OVERVIEW
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          
          <div 
            onClick={() => { setStatusFilter('New Complaint'); }}
            className="card" 
            style={{ cursor: 'pointer', borderLeft: '4px solid #1d4ed8', backgroundColor: newCount > 0 ? '#eff6ff' : '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1d4ed8' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>NEW REQUESTS</span>
              <AlertCircle size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0.3rem 0' }}>
              {newCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: newCount > 0 ? '#1e40af' : '#64748b', fontWeight: 600 }}>
              {newCount > 0 ? 'Requires phone confirmation' : 'All caught up!'}
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Repair In Progress')}
            className="card" 
            style={{ cursor: 'pointer', borderLeft: '4px solid #0284c7' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0284c7' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>IN PROGRESS / REPAIR</span>
              <Wrench size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0.3rem 0' }}>
              {inProgressCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Active shop repairs
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Repair Completed')}
            className="card" 
            style={{ cursor: 'pointer', borderLeft: '4px solid #16a34a' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#16a34a' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>COMPLETED</span>
              <CheckCircle2 size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0.3rem 0' }}>
              {completedCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Repairs completed
            </div>
          </div>

          <div 
            onClick={() => setStatusFilter('Payment Pending')}
            className="card" 
            style={{ cursor: 'pointer', borderLeft: '4px solid #b45309', backgroundColor: paymentPendingCount > 0 ? '#fffbebf' : '#ffffff' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b45309' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>PAYMENT PENDING</span>
              <Clock size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: '0.3rem 0' }}>
              {paymentPendingCount}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
              Awaiting payment collection
            </div>
          </div>

        </div>
      </div>

      {/* SERVICE REQUESTS LIST */}
      <div className="card" style={{ padding: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
              All Service Complaints ({filteredComplaints.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Click any complaint row to view details, update status, or issue invoice.
            </p>
          </div>

          {/* Search & Quick Filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '15px', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search ID, customer, area..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.2rem', height: '42px', fontSize: '0.9rem' }}
              />
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
              style={{ height: '42px', width: 'auto', fontSize: '0.875rem', fontWeight: 600 }}
            >
              <option value="ALL">All Statuses</option>
              <option value="New Complaint">New Complaint</option>
              <option value="Contacted">Contacted</option>
              <option value="Inspection">Inspection</option>
              <option value="Repair In Progress">Repair In Progress</option>
              <option value="Repair Completed">Repair Completed</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {filteredComplaints.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <AlertCircle size={42} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No complaints match your search filter</h3>
            <p style={{ fontSize: '0.875rem' }}>Try clearing the search query or status dropdown filter.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Complaint ID</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Customer & Phone</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Address</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Appliance & Problem</th>
                  <th style={{ padding: '0.75rem 1rem', color: '#475569' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr 
                    key={c.id} 
                    onClick={() => onOpenComplaintDetail(c)}
                    style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 900, color: '#1d4ed8' }}>
                      {c.id}
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.customer.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#1d4ed8', fontWeight: 700 }}>{c.customer.mobile}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: '#334155' }}>
                      <div>{c.customer.houseNo}, {c.customer.streetArea}</div>
                      <div style={{ color: '#64748b' }}>{c.customer.city} - {c.customer.pincode}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{c.machine.brand} ({c.machine.type})</div>
                      <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>{c.problem.selectedProblems.join(', ')}</div>
                    </td>

                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={c.status} />
                    </td>

                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenComplaintDetail(c);
                        }}
                        className="btn btn-sm btn-secondary"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
