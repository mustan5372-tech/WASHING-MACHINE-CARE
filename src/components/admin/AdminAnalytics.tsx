import React from 'react';
import type { Complaint } from '../../types';
import { Wrench, PieChart } from 'lucide-react';

interface AdminAnalyticsProps {
  complaints: Complaint[];
  technicians?: any[];
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ complaints }) => {
  // Total Revenue Calculation
  const totalRevenue = complaints.reduce((sum, c) => {
    if (c.serviceRecord && c.serviceRecord.totalAmount) {
      return sum + c.serviceRecord.totalAmount;
    }
    return sum;
  }, 0);

  const completedCount = complaints.filter(c => c.status === 'Repair Completed' || c.status === 'Paid').length;
  const pendingPaymentSum = complaints.reduce((sum, c) => {
    if (c.serviceRecord && c.serviceRecord.paymentStatus === 'Pending') {
      return sum + c.serviceRecord.totalAmount;
    }
    return sum;
  }, 0);

  // Brand Breakdown Stats
  const brandCounts: Record<string, number> = {};
  complaints.forEach(c => {
    if (!c) return;
    const b = c.machine?.brand || 'Washing Machine';
    brandCounts[b] = (brandCounts[b] || 0) + 1;
  });

  // Problem Breakdown Stats
  const problemCounts: Record<string, number> = {};
  complaints.forEach(c => {
    if (!c) return;
    (c.problem?.selectedProblems || []).forEach(p => {
      problemCounts[p] = (problemCounts[p] || 0) + 1;
    });
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.2rem' }}>
          Service Performance & Analytics
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
          Business metrics, total revenue earned, top brands serviced, and complaint breakdown
        </p>
      </div>

      {/* Top Revenue & Volume Metric Cards */}
      <div className="grid-3">
        <div className="card" style={{ borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>TOTAL SERVICE REVENUE</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
            ₹{totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.825rem', color: '#64748b' }}>From {completedCount} completed repair jobs</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>PENDING COLLECTIONS</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
            ₹{pendingPaymentSum.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.825rem', color: '#64748b' }}>Uncollected pending customer bills</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #1d4ed8' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase' }}>TOTAL REQUESTS RECORDED</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '0.2rem 0' }}>
            {complaints.length}
          </div>
          <div style={{ fontSize: '0.825rem', color: '#64748b' }}>All-time service bookings</div>
        </div>
      </div>

      {/* Brand & Problem Breakdown Charts */}
      <div className="grid-2">
        
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={18} style={{ color: '#1d4ed8' }} /> Most Serviced Brands
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {Object.entries(brandCounts).map(([brand, count]) => (
              <div key={brand}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                  <span>{brand}</span>
                  <span>{count} repairs</span>
                </div>
                <div style={{ backgroundColor: '#f1f5f9', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#1d4ed8', width: `${Math.min(100, (count / (complaints.length || 1)) * 100)}%`, height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} style={{ color: '#dc2626' }} /> Top Washing Machine Problems
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {Object.entries(problemCounts).slice(0, 5).map(([prob, count]) => (
              <div key={prob}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.2rem' }}>
                  <span>{prob}</span>
                  <span>{count} cases</span>
                </div>
                <div style={{ backgroundColor: '#f1f5f9', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                  <div style={{ backgroundColor: '#dc2626', width: `${Math.min(100, (count / (complaints.length || 1)) * 100)}%`, height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
