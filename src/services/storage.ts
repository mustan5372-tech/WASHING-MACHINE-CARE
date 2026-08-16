import type { Complaint, BusinessSettings, AuditLog } from '../types';
import { INITIAL_COMPLAINTS, INITIAL_SETTINGS, INITIAL_AUDIT_LOGS } from '../data/mockData';
import { saveComplaintToFirebase } from './firebase';

const KEYS = {
  COMPLAINTS: 'wmc_complaints_v1',
  SETTINGS: 'wmc_settings_v1',
  AUDIT_LOGS: 'wmc_audit_logs_v1',
  COUNTER: 'wmc_complaint_counter_v1'
};

// COMPLAINTS STORAGE
export const getComplaints = (): Complaint[] => {
  try {
    const raw = localStorage.getItem(KEYS.COMPLAINTS);
    if (!raw) {
      localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(INITIAL_COMPLAINTS));
      return INITIAL_COMPLAINTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading complaints from localStorage:', err);
    return INITIAL_COMPLAINTS;
  }
};

export const saveComplaint = (complaint: Complaint): void => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === complaint.id);
  if (index >= 0) {
    complaints[index] = complaint;
  } else {
    complaints.unshift(complaint);
  }
  localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(complaints));
  saveComplaintToFirebase(complaint);
};

export const getComplaintById = (id: string): Complaint | undefined => {
  const complaints = getComplaints();
  return complaints.find(c => c.id.toLowerCase() === id.toLowerCase());
};

export const generateNextComplaintId = (): string => {
  try {
    const rawCounter = localStorage.getItem(KEYS.COUNTER);
    let counter = rawCounter ? parseInt(rawCounter, 10) : 105;
    counter += 1;
    localStorage.setItem(KEYS.COUNTER, counter.toString());
    const padded = counter.toString().padStart(6, '0');
    return `WMC-${padded}`;
  } catch (err) {
    console.error('Error generating complaint ID:', err);
    return `WMC-${Date.now().toString().slice(-6)}`;
  }
};

// BUSINESS SETTINGS STORAGE
export const getSettings = (): BusinessSettings => {
  try {
    const raw = localStorage.getItem(KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading settings from localStorage:', err);
    return INITIAL_SETTINGS;
  }
};

export const saveSettings = (settings: BusinessSettings): void => {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
};

// AUDIT LOGS
export const getAuditLogs = (): AuditLog[] => {
  try {
    const raw = localStorage.getItem(KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading audit logs:', err);
    return INITIAL_AUDIT_LOGS;
  }
};

export const addAuditLog = (user: string, action: string, details: string): void => {
  const logs = getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('en-US', { hour12: true }),
    user,
    action,
    details
  };
  logs.unshift(newLog);
  localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
};

export const clearAllData = (): void => {
  localStorage.removeItem(KEYS.COMPLAINTS);
  localStorage.removeItem(KEYS.AUDIT_LOGS);
  localStorage.removeItem(KEYS.COUNTER);
  window.location.reload();
};

export const resetToDemoData = (): void => {
  localStorage.clear();
  window.location.reload();
};
