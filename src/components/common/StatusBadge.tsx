import React from 'react';
import type { ComplaintStatus } from '../../types';
import { 
  AlertCircle, PhoneCall, Calendar, 
  Search, Wrench, Package, CheckCircle2, Clock, DollarSign, XCircle, AlertTriangle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'New Complaint':
        return { className: 'status-new', icon: AlertCircle, label: 'New Complaint' };
      case 'Contacted':
        return { className: 'status-contacted', icon: PhoneCall, label: 'Customer Contacted' };
      case 'Scheduled':
        return { className: 'status-scheduled', icon: Calendar, label: 'Visit Scheduled' };
      case 'Inspection':
        return { className: 'status-inspection', icon: Search, label: 'Under Inspection' };
      case 'Repair In Progress':
        return { className: 'status-in-progress', icon: Wrench, label: 'Repair In Progress' };
      case 'Waiting for Parts':
        return { className: 'status-waiting-parts', icon: Package, label: 'Waiting for Spare Parts' };
      case 'Repair Completed':
        return { className: 'status-completed', icon: CheckCircle2, label: 'Repair Completed' };
      case 'Payment Pending':
        return { className: 'status-pending-pay', icon: Clock, label: 'Payment Pending' };
      case 'Paid':
        return { className: 'status-paid', icon: DollarSign, label: 'Paid & Completed' };
      case 'Cancelled':
        return { className: 'status-cancelled', icon: XCircle, label: 'Cancelled' };
      case 'Unable to Repair':
        return { className: 'status-cancelled', icon: AlertTriangle, label: 'Unable to Repair' };
      default:
        return { className: 'status-new', icon: AlertCircle, label: status };
    }
  };

  const config = getBadgeConfig();
  const IconComponent = config.icon;

  return (
    <span className={`status-badge ${config.className}`}>
      {showIcon && <IconComponent size={14} style={{ marginRight: '4px' }} />}
      {config.label}
    </span>
  );
};
