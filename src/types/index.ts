export type Role = 'customer' | 'admin' | 'staff';

export type MachineType = 
  | 'Fully Automatic Top Load'
  | 'Fully Automatic Front Load'
  | 'Semi Automatic'
  | 'Washer Dryer'
  | 'Other';

export type MachineAge = 
  | 'Less than 1 year'
  | '1–3 years'
  | '3–5 years'
  | '5–8 years'
  | 'More than 8 years'
  | "Don't know";

export type ProblemType =
  | 'Not Starting'
  | 'Not Draining Water'
  | 'Not Filling Water'
  | 'Making Noise'
  | 'Not Spinning'
  | 'Not Washing Properly'
  | 'Water Leakage'
  | 'Door/Lid Problem'
  | 'Error Code'
  | 'Electricity/Shock Problem'
  | 'Dryer Problem'
  | 'Other Problem'
  | "I don't know what's wrong";

export type ComplaintStatus =
  | 'New Complaint'
  | 'Contacted'
  | 'Scheduled'
  | 'Inspection'
  | 'Repair In Progress'
  | 'Waiting for Parts'
  | 'Repair Completed'
  | 'Payment Pending'
  | 'Paid'
  | 'Cancelled'
  | 'Unable to Repair';

export type PaymentStatus = 'Pending' | 'Cash Paid' | 'UPI Paid' | 'Online Paid' | 'Other';

export interface CustomerDetails {
  name: string;
  mobile: string;
  whatsapp: string;
  whatsappSameAsMobile: boolean;
  houseNo: string;
  streetArea: string;
  landmark?: string;
  city: string;
  pincode: string;
}

export interface MachineDetails {
  brand: string;
  otherBrand?: string;
  type: MachineType;
  age: MachineAge;
}

export interface ProblemDetails {
  selectedProblems: ProblemType[];
  errorCode?: string;
  additionalDetails?: string;
  photoUrl?: string;
}

export interface PreferredVisit {
  date: string;
  timeSlot: string;
}

export interface PartItem {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

export interface ServiceRecord {
  inspectionNotes?: string;
  workDoneNotes?: string;
  partsUsed: PartItem[];
  serviceCharge: number;
  partsCharge: number;
  otherCharge: number;
  discount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  beforePhotos: string[];
  afterPhotos: string[];
  completedAt?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  status?: ComplaintStatus;
  title: string;
  description: string;
  author: string;
}

export interface Complaint {
  id: string; // e.g. WMC-000123
  customer: CustomerDetails;
  machine: MachineDetails;
  problem: ProblemDetails;
  visit: PreferredVisit;
  status: ComplaintStatus;
  serviceRecord?: ServiceRecord;
  timeline: TimelineEvent[];
  internalNotes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettings {
  businessName: string;
  domain: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  pincodesServed: string[];
  timeSlots: string[];
  complaintPrefix: string;
  notificationsEnabled: boolean;
  whatsappNotificationsEnabled: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface UserSession {
  role: Role;
  name: string;
  email: string;
}
