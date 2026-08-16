import type { Complaint, BusinessSettings } from '../types';

export const buildWhatsAppUrl = (phoneNumber: string, message: string): string => {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
};

export const createCustomerWhatsAppMessage = (complaint: Complaint, settings: BusinessSettings): string => {
  return `Hello ${complaint.customer.name},

Thank you for choosing *${settings.businessName}*! Your repair service complaint has been registered.

*Complaint Number:* ${complaint.id}
*Machine Brand:* ${complaint.machine.brand} (${complaint.machine.type})
*Reported Issue:* ${complaint.problem.selectedProblems.join(', ')}

Our team will contact you shortly on ${complaint.customer.mobile}.

*Address:*
${complaint.customer.houseNo}, ${complaint.customer.streetArea}, ${complaint.customer.city} - ${complaint.customer.pincode}

Shop Address: ${settings.address}
Contact: ${settings.phone}
Website: https://${settings.domain}`;
};
