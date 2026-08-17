import type { Complaint, BusinessSettings, AuditLog } from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'Washing Machine Care',
  domain: 'washingmachinecare.shop',
  logoUrl: '/logo.png',
  phone: '+91 9926064529',
  secondaryPhone: '+91 9826247802',
  whatsapp: '919926064529',
  email: 'support@washingmachinecare.shop',
  address: '41, Madhuban, Opposite Annpurna Police Thana, Annapurna Main Road, Annapurna Road, Indore-452009, Madhya Pradesh',
  workingHours: '8:00 AM - 8:00 PM (Mon - Sun)',
  pincodesServed: ['452009', '452001', '452002', '452003', '452004', '452010', '452012'],
  timeSlots: ['9 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM', '6 PM – 8 PM'],
  complaintPrefix: 'WMC-',
  notificationsEnabled: true,
  whatsappNotificationsEnabled: true
};

// Clean initial state: 0 fake complaints. All data will be created fresh via Firebase & live site.
export const INITIAL_COMPLAINTS: Complaint[] = [];

// Clean audit logs
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
