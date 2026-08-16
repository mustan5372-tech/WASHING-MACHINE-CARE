import type { Complaint, BusinessSettings, AuditLog } from '../types';

export const INITIAL_SETTINGS: BusinessSettings = {
  businessName: 'Washing Machine Care',
  domain: 'washingmachinecare.shop',
  logoUrl: '/logo.png',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'support@washingmachinecare.shop',
  address: '41, Madhuban, Opposite Annpurna Police Thana, Annapurna Main Road, Annapurna Road, Indore-452009, Madhya Pradesh',
  workingHours: '8:00 AM - 8:00 PM (Mon - Sun)',
  pincodesServed: ['452009', '452001', '452002', '452003', '452004', '452010', '452012'],
  timeSlots: ['9 AM – 12 PM', '12 PM – 3 PM', '3 PM – 6 PM', '6 PM – 8 PM'],
  complaintPrefix: 'WMC-',
  notificationsEnabled: true,
  whatsappNotificationsEnabled: true
};

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'WMC-000101',
    customer: {
      name: 'Ramesh Patel',
      mobile: '9892012345',
      whatsapp: '9892012345',
      whatsappSameAsMobile: true,
      houseNo: 'B-204, Sun City Apartments',
      streetArea: 'City Center',
      landmark: 'Near Central Bank',
      city: 'Indore',
      pincode: '452009'
    },
    machine: {
      brand: 'LG',
      type: 'Fully Automatic Front Load',
      age: '3–5 years'
    },
    problem: {
      selectedProblems: ['Not Draining Water', 'Making Noise'],
      additionalDetails: 'Machine makes heavy buzzing sound during drain cycle and water stays inside drum.'
    },
    visit: {
      date: 'ASAP / Immediate',
      timeSlot: 'As soon as possible'
    },
    status: 'Contacted',
    timeline: [
      {
        id: 'evt-1',
        timestamp: '2026-08-16 09:15 AM',
        status: 'New Complaint',
        title: 'Complaint Registered',
        description: 'Customer registered service request via website form.',
        author: 'System'
      },
      {
        id: 'evt-2',
        timestamp: '2026-08-16 09:40 AM',
        status: 'Contacted',
        title: 'Customer Contacted',
        description: 'Admin confirmed issue details.',
        author: 'Admin'
      }
    ],
    internalNotes: ['Customer requested call before team arrives.'],
    createdAt: '2026-08-16T09:15:00Z',
    updatedAt: '2026-08-16T10:05:00Z'
  },
  {
    id: 'WMC-000102',
    customer: {
      name: 'Priya Sundaram',
      mobile: '9821098765',
      whatsapp: '9821098765',
      whatsappSameAsMobile: true,
      houseNo: '14/A, Gokul Heights',
      streetArea: 'Model Town',
      landmark: 'Opposite Dominoes Pizza',
      city: 'Indore',
      pincode: '452009'
    },
    machine: {
      brand: 'Samsung',
      type: 'Fully Automatic Top Load',
      age: '1–3 years'
    },
    problem: {
      selectedProblems: ['Error Code'],
      errorCode: '4E',
      additionalDetails: 'Display shows 4E code after 2 minutes of starting.'
    },
    visit: {
      date: 'ASAP / Immediate',
      timeSlot: 'As soon as possible'
    },
    status: 'New Complaint',
    timeline: [
      {
        id: 'evt-10',
        timestamp: '2026-08-16 11:30 AM',
        status: 'New Complaint',
        title: 'Complaint Registered',
        description: 'Customer registered service request online.',
        author: 'Customer'
      }
    ],
    createdAt: '2026-08-16T11:30:00Z',
    updatedAt: '2026-08-16T11:30:00Z'
  },
  {
    id: 'WMC-000103',
    customer: {
      name: 'Anil Kapoor',
      mobile: '9765412300',
      whatsapp: '9765412300',
      whatsappSameAsMobile: true,
      houseNo: 'Plot 45, Green Valley',
      streetArea: 'Civil Lines',
      landmark: 'Behind St. Mary School',
      city: 'Indore',
      pincode: '452001'
    },
    machine: {
      brand: 'Whirlpool',
      type: 'Semi Automatic',
      age: '5–8 years'
    },
    problem: {
      selectedProblems: ['Not Spinning', 'Dryer Problem'],
      additionalDetails: 'Spin tub is not rotating. Wash tub is working fine.'
    },
    visit: {
      date: 'ASAP / Immediate',
      timeSlot: 'As soon as possible'
    },
    status: 'Repair In Progress',
    serviceRecord: {
      inspectionNotes: 'Spin tub capacitor burnt out. Brake wire loose.',
      workDoneNotes: 'Replaced spin motor capacitor (10uF) and re-aligned brake wire cable.',
      partsUsed: [
        { id: 'p1', name: 'Spin Motor Capacitor 10uF', quantity: 1, cost: 350 },
        { id: 'p2', name: 'Spin Brake Wire Assembly', quantity: 1, cost: 150 }
      ],
      serviceCharge: 400,
      partsCharge: 500,
      otherCharge: 0,
      discount: 50,
      totalAmount: 850,
      paymentStatus: 'Pending',
      beforePhotos: [],
      afterPhotos: []
    },
    timeline: [
      {
        id: 'evt-20',
        timestamp: '2026-08-16 08:30 AM',
        status: 'New Complaint',
        title: 'Complaint Registered',
        description: 'New service request booked.',
        author: 'System'
      },
      {
        id: 'evt-23',
        timestamp: '2026-08-16 10:15 AM',
        status: 'Repair In Progress',
        title: 'Inspection & Repair Started',
        description: 'Diagnosed capacitor failure. Replacing parts.',
        author: 'Admin'
      }
    ],
    createdAt: '2026-08-16T08:30:00Z',
    updatedAt: '2026-08-16T10:15:00Z'
  },
  {
    id: 'WMC-000104',
    customer: {
      name: 'Sunita Rao',
      mobile: '9819876543',
      whatsapp: '9819876543',
      whatsappSameAsMobile: true,
      houseNo: 'Flat 302, Sagar View',
      streetArea: 'Lake View',
      landmark: 'Near Lake Park',
      city: 'Indore',
      pincode: '452002'
    },
    machine: {
      brand: 'IFB',
      type: 'Fully Automatic Front Load',
      age: '3–5 years'
    },
    problem: {
      selectedProblems: ['Water Leakage'],
      additionalDetails: 'Water leaks out from front door gasket during rinse phase.'
    },
    visit: {
      date: 'ASAP / Immediate',
      timeSlot: 'As soon as possible'
    },
    status: 'Repair Completed',
    serviceRecord: {
      inspectionNotes: 'Door rubber gasket was torn near bottom drain hole.',
      workDoneNotes: 'Replaced IFB Front Load Door Rubber Gasket seal and tested full water cycle.',
      partsUsed: [
        { id: 'p3', name: 'IFB Door Rubber Gasket Seal', quantity: 1, cost: 1200 }
      ],
      serviceCharge: 600,
      partsCharge: 1200,
      otherCharge: 0,
      discount: 0,
      totalAmount: 1800,
      paymentStatus: 'UPI Paid',
      beforePhotos: [],
      afterPhotos: [],
      completedAt: '2026-08-15 05:20 PM'
    },
    timeline: [
      {
        id: 'evt-30',
        timestamp: '2026-08-15 01:00 PM',
        status: 'New Complaint',
        title: 'Complaint Registered',
        description: 'Online request.',
        author: 'System'
      },
      {
        id: 'evt-32',
        timestamp: '2026-08-15 05:20 PM',
        status: 'Repair Completed',
        title: 'Repair Completed & Paid',
        description: 'Door rubber gasket replaced. Payment received via UPI.',
        author: 'Admin'
      }
    ],
    createdAt: '2026-08-15T13:00:00Z',
    updatedAt: '2026-08-15T17:20:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-16 10:05 AM',
    user: 'Admin',
    action: 'UPDATE_STATUS',
    details: 'Changed status of WMC-000101 to Contacted'
  },
  {
    id: 'log-2',
    timestamp: '2026-08-15 05:20 PM',
    user: 'Admin',
    action: 'COMPLETE_REPAIR',
    details: 'Completed repair WMC-000104. Payment recorded: UPI Paid ₹1800'
  }
];
