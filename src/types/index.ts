export type UserRole = 'OWNER' | 'ADMIN' | 'STAFF';

export type OrderStatus = 'NEW' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'UNPAID' | 'DOWN_PAYMENT' | 'PAID';

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS' | 'COD';

export type CustomerLevel = 'RETAIL' | 'RESELLER' | 'WHOLESALE';

export type MessageLanguage = 'ID' | 'EN';

export interface Shop {
  id: string;
  name: string;
  description?: string;
  phone: string;
  address?: string;
  logo?: string;
  operatingHours?: OperatingHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface OperatingHours {
  enabled: boolean;
  start: string; // HH:mm format
  end: string;
  outsideHoursMessage: string;
  busyMessage: string;
}

export interface AppSession {
  id: string;
  currentShopId: string;
  currentRole: UserRole;
  userName: string;
  updatedAt: Date;
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Size"
  option: string; // e.g., "Large"
  priceModifier: number; // additional price
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  level: CustomerLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerTag {
  id: string;
  shopId: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerTagJoin {
  id: string;
  customerId: string;
  tagId: string;
  createdAt: Date;
}

export interface PriceLevel {
  id: string;
  shopId: string;
  productId: string;
  level: CustomerLevel;
  discountPercent?: number;
  customPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  shopId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  notes?: string;
  priority?: 'NORMAL' | 'URGENT';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  variantInfo?: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: Date;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedBy: string;
  notes?: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingArea {
  id: string;
  shopId: string;
  name: string;
  cost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageTemplate {
  id: string;
  shopId: string;
  name: string;
  language: MessageLanguage;
  subject?: string;
  content: string;
  variables: string[]; // e.g., ["{nama}", "{total}", "{order_id}"]
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  orderId: string;
  message: string;
  dueDate: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  shopId: string;
  action: string;
  entityType: string; // 'order', 'product', 'customer'
  entityId: string;
  details?: string;
  performedBy: string;
  createdAt: Date;
}

export interface OrderTemplate {
  id: string;
  shopId: string;
  name: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
