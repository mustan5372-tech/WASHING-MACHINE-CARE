import type { Complaint, BusinessSettings, AuditLog, ProblemType } from '../types';
import { INITIAL_SETTINGS, INITIAL_AUDIT_LOGS } from '../data/mockData';
import { saveComplaintToFirebase } from './firebase';

const KEYS = {
  COMPLAINTS: 'wmc_complaints_v1',
  SETTINGS: 'wmc_settings_v1',
  AUDIT_LOGS: 'wmc_audit_logs_v1',
  COUNTER: 'wmc_complaint_counter_v1',
  DELETED_IDS: 'wmc_deleted_ids_v1',
  PURGED_AT: 'wmc_purged_at_v1'
};

// Helper to get blacklist of deleted complaint IDs
export const getDeletedComplaintIds = (): string[] => {
  try {
    const raw = localStorage.getItem(KEYS.DELETED_IDS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getPurgedAtTimestamp = (): number => {
  try {
    const raw = localStorage.getItem(KEYS.PURGED_AT);
    return raw ? parseInt(raw, 10) : 0;
  } catch (e) {
    return 0;
  }
};

export const isLegacyTestComplaint = (id: string, createdAt?: string): boolean => {
  if (!id) return true;
  const lower = id.toLowerCase();
  
  // Permanent blacklist of all known test IDs
  const TEST_PATTERNS = [
    'wmc-000101', 'wmc-000102', 'wmc-000103', 'wmc-000104',
    'wmc-000105', 'wmc-000106', 'wmc-000107', 'wmc-000108',
    'wmc-000109', 'wmc-000110', 'test', 'demo'
  ];
  if (TEST_PATTERNS.some(p => lower.includes(p))) return true;

  // Filter out any legacy test complaints created before August 18, 2026 10:00:00 UTC
  if (createdAt) {
    const t = new Date(createdAt).getTime();
    if (!isNaN(t) && t < 1787046000000) return true;
  }

  return false;
};

// COMPLAINTS STORAGE
export const getComplaints = (): Complaint[] => {
  try {
    const deletedIds = getDeletedComplaintIds();
    const purgedAt = getPurgedAtTimestamp();
    const raw = localStorage.getItem(KEYS.COMPLAINTS);
    if (!raw) {
      localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify([]));
      return [];
    }
    const parsed: Complaint[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    return parsed
      .filter(c => {
        if (!c || typeof c !== 'object' || !c.id) return false;
        if (isLegacyTestComplaint(c.id, c.createdAt)) return false;

        const lowerId = c.id.toLowerCase();
        if (deletedIds.includes(lowerId)) return false;
        if ((c as any).isDeleted === true || (c as any).status === 'DELETED') return false;
        if (purgedAt > 0 && c.createdAt) {
          const cTime = new Date(c.createdAt).getTime();
          if (!isNaN(cTime) && cTime <= purgedAt) return false;
        }
        return true;
      })
      .map(c => ({
        ...c,
        customer: {
          name: c.customer?.name || 'Customer',
          mobile: c.customer?.mobile || '',
          whatsapp: c.customer?.whatsapp || c.customer?.mobile || '',
          whatsappSameAsMobile: c.customer?.whatsappSameAsMobile ?? true,
          houseNo: c.customer?.houseNo || '',
          streetArea: c.customer?.streetArea || '',
          landmark: c.customer?.landmark || '',
          city: c.customer?.city || 'Banswara',
          pincode: c.customer?.pincode || '327001'
        },
        machine: {
          brand: c.machine?.brand || 'Washing Machine',
          otherBrand: c.machine?.otherBrand || '',
          type: c.machine?.type || 'Fully Automatic Top Load',
          age: c.machine?.age || '1–3 years'
        },
        problem: {
          selectedProblems: Array.isArray(c.problem?.selectedProblems) && c.problem.selectedProblems.length > 0 
            ? c.problem.selectedProblems 
            : ['Other Problem' as ProblemType],
          errorCode: c.problem?.errorCode || '',
          additionalDetails: c.problem?.additionalDetails || ''
        },
        status: c.status || 'New Complaint',
        createdAt: c.createdAt || new Date().toISOString()
      }));
  } catch (err) {
    console.error('Error reading complaints from localStorage:', err);
    return [];
  }
};

export const saveComplaint = (complaint: Complaint): void => {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id.toLowerCase() === complaint.id.toLowerCase());
  const isNew = index < 0;

  if (index >= 0) {
    complaints[index] = complaint;
  } else {
    complaints.unshift(complaint);
  }
  localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(complaints));
  saveComplaintToFirebase(complaint);
  window.dispatchEvent(new Event('wmc_complaints_updated'));

  if (isNew) {
    window.dispatchEvent(new CustomEvent('wmc_new_booking_created', { detail: complaint }));
  }
};

export const deleteComplaintLocal = (id: string): void => {
  const lowerId = id.toLowerCase();
  
  // 1. Save to persistent deleted IDs blacklist
  const deletedIds = getDeletedComplaintIds();
  if (!deletedIds.includes(lowerId)) {
    deletedIds.push(lowerId);
    localStorage.setItem(KEYS.DELETED_IDS, JSON.stringify(deletedIds));
  }

  // 2. Filter out from local complaints
  const raw = localStorage.getItem(KEYS.COMPLAINTS);
  if (raw) {
    try {
      const complaints: Complaint[] = JSON.parse(raw);
      const filtered = complaints.filter(c => c && c.id && c.id.toLowerCase() !== lowerId);
      localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify(filtered));
    } catch (e) {}
  }

  window.dispatchEvent(new Event('wmc_complaints_updated'));
};

export const purgeAllComplaintsLocal = (): void => {
  // Collect all current complaint IDs to permanent blacklist
  const currentComplaints = getComplaints();
  const deletedIds = getDeletedComplaintIds();
  currentComplaints.forEach(c => {
    if (c && c.id) {
      const lower = c.id.toLowerCase();
      if (!deletedIds.includes(lower)) {
        deletedIds.push(lower);
      }
    }
  });

  const now = Date.now();
  localStorage.setItem(KEYS.PURGED_AT, now.toString());
  localStorage.setItem(KEYS.DELETED_IDS, JSON.stringify(deletedIds));
  localStorage.setItem(KEYS.COMPLAINTS, JSON.stringify([]));
  localStorage.removeItem(KEYS.COUNTER);
  sessionStorage.removeItem('wmc_alerted_ids');
  window.dispatchEvent(new Event('wmc_complaints_updated'));
};

export const getComplaintById = (id: string): Complaint | undefined => {
  const complaints = getComplaints();
  return complaints.find(c => c.id.toLowerCase() === id.toLowerCase());
};

/**
 * Generate Guaranteed Unique Complaint ID by scanning highest existing ID number
 */
export const generateNextComplaintId = (): string => {
  try {
    const complaints = getComplaints();
    let maxNum = 105;

    // Scan all existing complaints to find the highest number
    complaints.forEach(c => {
      if (!c || !c.id) return;
      const match = c.id.match(/WMC-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    // Check local counter if higher
    const rawCounter = localStorage.getItem(KEYS.COUNTER);
    if (rawCounter) {
      const cNum = parseInt(rawCounter, 10);
      if (!isNaN(cNum) && cNum > maxNum) {
        maxNum = cNum;
      }
    }

    const nextNum = maxNum + 1;
    localStorage.setItem(KEYS.COUNTER, nextNum.toString());

    const padded = nextNum.toString().padStart(6, '0');
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
    const parsed: BusinessSettings = JSON.parse(raw);
    let updated = false;
    if (parsed.phone !== '+91 9926064529') {
      parsed.phone = '+91 9926064529';
      updated = true;
    }
    if (parsed.secondaryPhone !== '+91 9826247802') {
      parsed.secondaryPhone = '+91 9826247802';
      updated = true;
    }
    if (updated) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(parsed));
    }
    return parsed;
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
  purgeAllComplaintsLocal();
  window.dispatchEvent(new Event('wmc_complaints_updated'));
};

export const resetToDemoData = (): void => {
  purgeAllComplaintsLocal();
  window.dispatchEvent(new Event('wmc_complaints_updated'));
};
