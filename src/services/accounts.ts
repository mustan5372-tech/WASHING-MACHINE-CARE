import type { UserSession } from '../types';

export interface AdminAccount {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password: string;
  role: 'super_admin' | 'admin' | 'staff';
  createdAt: string;
}

const STORAGE_KEY = 'wmc_admin_accounts_v1';
const SESSION_KEY = 'wmc_active_user_session_v1';

// Initial Registered Accounts
const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: 'admin-1',
    name: 'Mustansir Sanawadwala (Super Admin)',
    mobile: '9238728746',
    email: 'mustansir@washingmachinecare.shop',
    password: 'Mustan@525',
    role: 'super_admin',
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
  },
  {
    id: 'admin-3',
    name: 'Husain Ali',
    mobile: '9826247802',
    email: 'husainali@washingmachinecare.shop',
    password: '515253',
    role: 'admin',
    createdAt: '2026-08-17T09:34:00Z'
  }
];

/**
 * Restore active user session from localStorage (stay logged in permanently)
 */
export const getSavedUserSession = (): UserSession => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed: UserSession = JSON.parse(raw);
      if (parsed && (parsed.role === 'super_admin' || parsed.role === 'admin' || parsed.role === 'staff' || parsed.role === 'customer')) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading saved user session:', e);
  }
  return {
    role: 'customer',
    name: 'Customer Guest',
    email: 'guest@washingmachinecare.shop'
  };
};

/**
 * Persist active user session to localStorage
 */
export const saveUserSession = (session: UserSession) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error saving user session:', e);
  }
};

/**
 * Clear user session (sign out)
 */
export const clearUserSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {}
};

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
    
    // Ensure Super Admin Mustansir Sanawadwala exists & has super_admin role
    const superIdx = accounts.findIndex(a => normalizeMobile(a.mobile) === '9238728746');
    if (superIdx < 0) {
      accounts.unshift(INITIAL_ADMINS[0]);
    } else {
      accounts[superIdx].role = 'super_admin';
    }

    // Ensure Mufaddal Husaini exists
    if (!accounts.some(a => normalizeMobile(a.mobile) === '9926064529')) {
      accounts.push(INITIAL_ADMINS[1]);
    }

    // Ensure Husain Ali exists
    if (!accounts.some(a => normalizeMobile(a.mobile) === '9826247802')) {
      accounts.push(INITIAL_ADMINS[2]);
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
    // If mobile is 9238728746, enforce super_admin role
    const effectiveRole = normalizeMobile(matched.mobile) === '9238728746' ? 'super_admin' : matched.role;

    const session: UserSession = {
      role: effectiveRole,
      name: matched.name,
      email: matched.email || matched.mobile
    };
    saveUserSession(session);
    return session;
  }

  return null;
};

/**
 * Register a new Admin / Staff account
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

/**
 * Delete an admin or staff account (Super Admin 9238728746 protected!)
 */
export const deleteAdminAccount = (id: string): boolean => {
  const accounts = getAdminAccounts();
  const target = accounts.find(a => a.id === id);
  if (target && normalizeMobile(target.mobile) === '9238728746') {
    return false; // Protection: Cannot delete Super Admin
  }
  const filtered = accounts.filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

/**
 * Update role or password of an admin/staff account
 */
export const updateAdminAccountDetails = (id: string, updates: Partial<AdminAccount>): boolean => {
  const accounts = getAdminAccounts();
  const index = accounts.findIndex(a => a.id === id);
  if (index < 0) return false;

  const target = accounts[index];
  if (normalizeMobile(target.mobile) === '9238728746') {
    // Force super_admin role for 9238728746
    updates.role = 'super_admin';
  }

  accounts[index] = {
    ...accounts[index],
    ...updates
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  return true;
};
