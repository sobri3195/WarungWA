import type { Order, Customer, Shop } from '../../types';

export interface TemplateVariables {
  [key: string]: string | number;
}

export function replaceTemplateVariables(
  template: string,
  variables: TemplateVariables
): string {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  });
  
  return result;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
  }).format(date);
}

export function generateOrderVariables(
  order: Order,
  customer?: Customer,
  shop?: Shop
): TemplateVariables {
  return {
    nama: customer?.name || order.customerName,
    phone: customer?.phone || order.customerPhone,
    alamat: order.customerAddress || customer?.address || '-',
    order_id: order.id.substring(0, 8).toUpperCase(),
    total: formatCurrency(order.total),
    subtotal: formatCurrency(order.subtotal),
    ongkir: formatCurrency(order.shippingCost),
    diskon: formatCurrency(order.discount),
    tanggal: formatDate(order.createdAt),
    toko: shop?.name || 'Warung Kita',
  };
}

export function generateWhatsAppLink(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  const formattedPhone = cleanPhone.startsWith('0')
    ? '62' + cleanPhone.substring(1)
    : cleanPhone.startsWith('62')
    ? cleanPhone
    : '62' + cleanPhone;
  
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}

export function openWhatsApp(phone: string, message: string): void {
  const link = generateWhatsAppLink(phone, message);
  window.open(link, '_blank');
}

export function isOperatingHours(shop: Shop): boolean {
  if (!shop.operatingHours?.enabled) {
    return true;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = shop.operatingHours.start.split(':').map(Number);
  const [endHour, endMin] = shop.operatingHours.end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  
  return currentTime >= startTime && currentTime <= endTime;
}

export function getAutoReplyMessage(shop: Shop, isBusy: boolean = false): string | null {
  if (!shop.operatingHours?.enabled) {
    return null;
  }

  if (isBusy) {
    return shop.operatingHours.busyMessage;
  }

  if (!isOperatingHours(shop)) {
    return shop.operatingHours.outsideHoursMessage;
  }

  return null;
}
