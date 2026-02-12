import type { Order, Customer, MessageTemplate } from './db';

// ============================================================
// WhatsApp Template Variables
// ============================================================

export interface TemplateVariables {
  nama?: string;
  order_id?: string;
  total?: string;
  alamat?: string;
  invoice_link?: string;
  [key: string]: string | undefined;
}

/**
 * Replace template variables with actual values
 * Variables format: {nama}, {order_id}, {total}, {alamat}, {invoice_link}
 */
export const replaceTemplateVariables = (
  template: string,
  variables: TemplateVariables
): string => {
  let result = template;
  
  Object.keys(variables).forEach((key) => {
    const value = variables[key] || '';
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, value);
  });
  
  return result;
};

/**
 * Format currency to Indonesian Rupiah
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Generate variables from order data
 */
export const getOrderVariables = (
  order: Order,
  customer?: Customer,
  invoiceUrl?: string
): TemplateVariables => {
  return {
    nama: customer?.name || order.customerName,
    order_id: order.orderNumber,
    total: formatCurrency(order.total),
    alamat: order.shippingAddress || customer?.address || '-',
    invoice_link: invoiceUrl || '',
  };
};

/**
 * Generate wa.me link with pre-filled message
 * @param phone - Phone number (with or without country code)
 * @param message - Pre-filled message
 */
export const generateWhatsAppLink = (
  phone: string,
  message: string
): string => {
  // Clean phone number (remove +, spaces, dashes)
  let cleanPhone = phone.replace(/[\s\-\+]/g, '');
  
  // Ensure country code (Indonesia = 62)
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }
  
  // URL encode message
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Generate WhatsApp link from order and template
 */
export const generateOrderWhatsAppLink = (
  order: Order,
  template: MessageTemplate,
  customer?: Customer,
  invoiceUrl?: string
): string => {
  const variables = getOrderVariables(order, customer, invoiceUrl);
  const message = replaceTemplateVariables(template.template, variables);
  
  return generateWhatsAppLink(order.customerPhone, message);
};

/**
 * Open WhatsApp in new tab
 */
export const openWhatsApp = (phone: string, message: string): void => {
  const link = generateWhatsAppLink(phone, message);
  window.open(link, '_blank');
};

/**
 * Open WhatsApp with order details
 */
export const openOrderWhatsApp = (
  order: Order,
  template: MessageTemplate,
  customer?: Customer,
  invoiceUrl?: string
): void => {
  const link = generateOrderWhatsAppLink(order, template, customer, invoiceUrl);
  window.open(link, '_blank');
};

// ============================================================
// Operating Hours Check
// ============================================================

export interface OperatingHoursConfig {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

/**
 * Check if current time is within operating hours
 */
export const isWithinOperatingHours = (
  operatingHours: OperatingHoursConfig[]
): { isOpen: boolean; message?: string } => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const todayHours = operatingHours.find(oh => oh.dayOfWeek === currentDay);
  
  if (!todayHours || !todayHours.isOpen) {
    return {
      isOpen: false,
      message: 'Maaf, kami sedang tutup hari ini.',
    };
  }
  
  if (currentTime < todayHours.openTime || currentTime > todayHours.closeTime) {
    return {
      isOpen: false,
      message: `Maaf, kami buka pada ${todayHours.openTime} - ${todayHours.closeTime}`,
    };
  }
  
  return { isOpen: true };
};

/**
 * Get auto-reply message based on operating hours
 */
export const getAutoReplyMessage = (
  operatingHours: OperatingHoursConfig[],
  customTemplate?: string
): string | null => {
  const status = isWithinOperatingHours(operatingHours);
  
  if (status.isOpen) {
    return null;
  }
  
  return customTemplate || status.message || 'Maaf, kami sedang tidak tersedia.';
};

/**
 * Format operating hours for display
 */
export const formatOperatingHours = (operatingHours: OperatingHoursConfig[]): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  const formatted = operatingHours
    .filter(oh => oh.isOpen)
    .map(oh => `${days[oh.dayOfWeek]}: ${oh.openTime} - ${oh.closeTime}`)
    .join('\n');
  
  return formatted || 'Tidak ada jam operasional';
};
