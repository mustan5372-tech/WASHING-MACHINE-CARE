import type { Complaint } from '../types';

export const exportComplaintsToCsv = (complaints: Complaint[], filename: string = 'WMC_Complaints_Report.csv') => {
  const headers = [
    'Complaint ID',
    'Date Created',
    'Customer Name',
    'Mobile',
    'Area',
    'Pincode',
    'Brand',
    'Machine Type',
    'Problem',
    'Status',
    'Total Amount (₹)',
    'Payment Status'
  ];

  const rows = complaints.map(c => [
    c.id,
    new Date(c.createdAt).toLocaleDateString(),
    `"${c.customer.name.replace(/"/g, '""')}"`,
    c.customer.mobile,
    `"${c.customer.streetArea.replace(/"/g, '""')}"`,
    c.customer.pincode,
    c.machine.brand,
    `"${c.machine.type}"`,
    `"${c.problem.selectedProblems.join(', ')}"`,
    `"${c.status}"`,
    c.serviceRecord ? c.serviceRecord.totalAmount : 0,
    c.serviceRecord ? c.serviceRecord.paymentStatus : 'Pending'
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
