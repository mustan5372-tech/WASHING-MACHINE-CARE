import type { UserSession } from '../types';

export interface AdminAccount {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

const STORAGE_KEY = 'wmc_admin_accounts_v1';

// Initial Registered Accounts
const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'admin-1',
    name: 'Mustansir Sanawadwala',
    mobile: '9238728746',
    email: 'mustansir@washingmachinecare.shop',
    password: 'Mustan@525',
    role: 'admin',
    createdAt: '2026-08-16T18:50:00Z'
  },
  {
    id: 'admin-2',
    name: 'Mufaddal Husaini',
    mobile: '9926064529',
    email: 'mufaddal@washingmachinecare.shop',
    password: '515253',
    role: 'admin',
    createdAt: '2026-08-17T09:32:00Z'
  }
];

/**
 * Get all registered admin & staff accounts
 */
export const getAdminAccounts = (): AdminAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS;
    }
    let accounts: AdminAccount[] = JSON.parse(raw);
    
    // Ensure primary owner Mustansir Sanawadwala exists
    if (!accounts.some(a => normalizeMobile(a.mobile) === '9238728746')) {
      accounts.unshift(INITIAL_ADMINS[0]);
    }

    // Ensure Mufaddal Husaini exists
    if (!accounts.some(a => normalizeMobile(a.mobile) === '9926064529')) {
      accounts.push(INITIAL_ADMINS[1]);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  } catch (err) {
    console.error('Error loading admin accounts:', err);
    return INITIAL_ADMINS;
  }
};

/**
 * Normalize mobile numbers (removes spaces, +91, 0, etc.)
 */
export const normalizeMobile = (num: string): string => {
  return num.replace(/\D/g, '').slice(-10);
};

/**
 * Authenticate Admin / Staff using Mobile Number & Password / PIN
 */
export const authenticateAdminAccount = (mobileOrEmail: string, pass: string): UserSession | null => {
  const accounts = getAdminAccounts();
  const inputClean = mobileOrEmail.trim().toLowerCase();
  const inputMobile = normalizeMobile(mobileOrEmail);

  const matched = accounts.find(acc => {
    const isMobileMatch = inputMobile.length >= 10 && normalizeMobile(acc.mobile) === inputMobile;
    const isEmailMatch = acc.email && acc.email.toLowerCase() === inputClean;
    const isPassMatch = acc.password === pass.trim();
    return (isMobileMatch || isEmailMatch) && isPassMatch;
  });

  if (matched) {
    return {
      role: matched.role,
      name: matched.name,
      email: matched.email || matched.mobile
    };
  }

  return null;
};

/**
 * Register a new Admin / Staff account (Multiple Admins Support)
 */
export const addAdminAccount = (newAccount: Omit<AdminAccount, 'id' | 'createdAt'>): AdminAccount => {
  const accounts = getAdminAccounts();
  const created: AdminAccount = {
    ...newAccount,
    id: `admin-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  accounts.push(created);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return created;
};
