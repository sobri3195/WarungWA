import Dexie, { type Table } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface Shop {
  id: string;
  name: string;
  phone: string;
  address: string;
  logo?: string;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSession {
  id: string; // always 'current'
  currentShopId: string;
  currentRole: 'OWNER' | 'ADMIN' | 'STAFF';
  userName: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  shopId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  categoryId?: string;
  sku?: string;
  name: string;
  description?: string;
  basePrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string; // e.g., "Size: Large"
  priceAdjustment: number; // +/- from base price
  stock?: number;
  sku?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CustomerLevel = 'RETAIL' | 'RESELLER' | 'GROSIR';

export interface CustomerLevelPricing {
  id: string;
  shopId: string;
  level: CustomerLevel;
  discountPercent: number; // e.g., 10 = 10%
  minQty?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  level: CustomerLevel;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTag {
  id: string;
  shopId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTagJoin {
  id: string;
  customerId: string;
  tagId: string;
  createdAt: string;
}

export type OrderStatus = 
  | 'BARU'
  | 'KONFIRMASI'
  | 'DIKEMAS'
  | 'DIKIRIM'
  | 'SELESAI'
  | 'DIBATALKAN';

export type PaymentStatus = 'BELUM_BAYAR' | 'DP' | 'LUNAS';

export type PaymentMethod = 'CASH' | 'TRANSFER' | 'QRIS' | 'OTHER';

export interface Order {
  id: string;
  orderNumber: string;
  shopId: string;
  customerId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  priority: 'NORMAL' | 'URGENT';
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  customerName: string;
  customerPhone: string;
  shippingAddress?: string;
  shippingAreaId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  changedBy: string;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface ShippingArea {
  id: string;
  shopId: string;
  name: string;
  cost: number;
  estimatedDays?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  shopId: string;
  name: string;
  language: 'ID' | 'EN';
  category: 'ORDER_CONFIRM' | 'SHIPPING' | 'FOLLOW_UP' | 'AUTO_REPLY' | 'CUSTOM';
  template: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  shopId: string;
  orderId?: string;
  customerId?: string;
  title: string;
  notes?: string;
  dueDate: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  shopId: string;
  entityType: 'ORDER' | 'CUSTOMER' | 'PRODUCT' | 'PAYMENT' | 'OTHER';
  entityId?: string;
  action: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface OperatingHours {
  id: string;
  shopId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuickCartTemplate {
  id: string;
  shopId: string;
  name: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// DEXIE DATABASE
// ============================================================

export class WarungWADatabase extends Dexie {
  shops!: Table<Shop, string>;
  appSession!: Table<AppSession, string>;
  categories!: Table<Category, string>;
  products!: Table<Product, string>;
  productVariants!: Table<ProductVariant, string>;
  customerLevelPricing!: Table<CustomerLevelPricing, string>;
  customers!: Table<Customer, string>;
  customerTags!: Table<CustomerTag, string>;
  customerTagJoin!: Table<CustomerTagJoin, string>;
  orders!: Table<Order, string>;
  orderItems!: Table<OrderItem, string>;
  orderStatusHistory!: Table<OrderStatusHistory, string>;
  payments!: Table<Payment, string>;
  shippingAreas!: Table<ShippingArea, string>;
  messageTemplates!: Table<MessageTemplate, string>;
  reminders!: Table<Reminder, string>;
  activityLogs!: Table<ActivityLog, string>;
  operatingHours!: Table<OperatingHours, string>;
  quickCartTemplates!: Table<QuickCartTemplate, string>;

  constructor() {
    super('WarungWADB');
    
    this.version(1).stores({
      shops: 'id, name',
      appSession: 'id',
      categories: 'id, shopId, name',
      products: 'id, shopId, categoryId, name, isActive',
      productVariants: 'id, productId, isActive',
      customerLevelPricing: 'id, shopId, level',
      customers: 'id, shopId, phone, name, level',
      customerTags: 'id, shopId, name',
      customerTagJoin: 'id, customerId, tagId',
      orders: 'id, orderNumber, shopId, customerId, status, paymentStatus, priority, createdAt',
      orderItems: 'id, orderId, productId',
      orderStatusHistory: 'id, orderId, status, createdAt',
      payments: 'id, orderId, createdAt',
      shippingAreas: 'id, shopId, isActive',
      messageTemplates: 'id, shopId, category, language',
      reminders: 'id, shopId, orderId, customerId, dueDate, isDone',
      activityLogs: 'id, shopId, entityType, entityId, createdAt',
      operatingHours: 'id, shopId, dayOfWeek',
      quickCartTemplates: 'id, shopId, name',
    });
  }
}

// Singleton instance
export const db = new WarungWADatabase();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export const generateId = () => uuidv4();

export const now = () => new Date().toISOString();

export const seedInitialData = async () => {
  const shopCount = await db.shops.count();
  
  if (shopCount > 0) {
    return; // Already seeded
  }

  // Create default shop
  const defaultShop: Shop = {
    id: generateId(),
    name: 'Toko Demo WarungWA',
    phone: '6281234567890',
    address: 'Jl. Contoh No. 123, Jakarta',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    createdAt: now(),
    updatedAt: now(),
  };

  await db.shops.add(defaultShop);

  // Set app session
  const session: AppSession = {
    id: 'current',
    currentShopId: defaultShop.id,
    currentRole: 'OWNER',
    userName: 'Admin',
    updatedAt: now(),
  };

  await db.appSession.add(session);

  // Seed categories
  const categories: Category[] = [
    { id: generateId(), shopId: defaultShop.id, name: 'Makanan', createdAt: now(), updatedAt: now() },
    { id: generateId(), shopId: defaultShop.id, name: 'Minuman', createdAt: now(), updatedAt: now() },
    { id: generateId(), shopId: defaultShop.id, name: 'Snack', createdAt: now(), updatedAt: now() },
  ];

  await db.categories.bulkAdd(categories);

  // Seed products
  const products: Product[] = [
    {
      id: generateId(),
      shopId: defaultShop.id,
      categoryId: categories[0].id,
      name: 'Nasi Goreng',
      description: 'Nasi goreng spesial dengan telur',
      basePrice: 15000,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      categoryId: categories[0].id,
      name: 'Mie Ayam',
      description: 'Mie ayam bakso',
      basePrice: 12000,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      categoryId: categories[1].id,
      name: 'Es Teh',
      description: 'Es teh manis',
      basePrice: 5000,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  await db.products.bulkAdd(products);

  // Seed variants for first product
  const variants: ProductVariant[] = [
    {
      id: generateId(),
      productId: products[0].id,
      name: 'Level Pedas: Sedang',
      priceAdjustment: 0,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      productId: products[0].id,
      name: 'Level Pedas: Pedas',
      priceAdjustment: 2000,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  await db.productVariants.bulkAdd(variants);

  // Seed customer level pricing
  const pricing: CustomerLevelPricing[] = [
    {
      id: generateId(),
      shopId: defaultShop.id,
      level: 'RETAIL',
      discountPercent: 0,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      level: 'RESELLER',
      discountPercent: 10,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      level: 'GROSIR',
      discountPercent: 20,
      minQty: 10,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  await db.customerLevelPricing.bulkAdd(pricing);

  // Seed customers
  const customers: Customer[] = [
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Budi Santoso',
      phone: '628123456789',
      address: 'Jl. Merdeka No. 45, Jakarta',
      level: 'RETAIL',
      notes: 'Pelanggan setia',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Siti Nurhaliza',
      phone: '628987654321',
      address: 'Jl. Sudirman No. 12, Bandung',
      level: 'RESELLER',
      notes: 'Reseller aktif',
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  await db.customers.bulkAdd(customers);

  // Seed customer tags
  const tags: CustomerTag[] = [
    { id: generateId(), shopId: defaultShop.id, name: 'VIP', color: '#FFD700', createdAt: now(), updatedAt: now() },
    { id: generateId(), shopId: defaultShop.id, name: 'Repeat', color: '#4CAF50', createdAt: now(), updatedAt: now() },
    { id: generateId(), shopId: defaultShop.id, name: 'New', color: '#2196F3', createdAt: now(), updatedAt: now() },
  ];

  await db.customerTags.bulkAdd(tags);

  // Seed shipping areas
  const shippingAreas: ShippingArea[] = [
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Jakarta Pusat',
      cost: 10000,
      estimatedDays: '1-2 hari',
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Jakarta Selatan',
      cost: 15000,
      estimatedDays: '1-2 hari',
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Luar Jakarta',
      cost: 25000,
      estimatedDays: '3-5 hari',
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  await db.shippingAreas.bulkAdd(shippingAreas);

  // Seed message templates
  const templates: MessageTemplate[] = [
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Konfirmasi Pesanan',
      language: 'ID',
      category: 'ORDER_CONFIRM',
      template: 'Halo {nama}, terima kasih sudah order! 🙏\n\nPesanan #{order_id}\nTotal: {total}\n\nAlamat pengiriman: {alamat}\n\nPesanan akan segera kami proses.',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Order Confirmation',
      language: 'EN',
      category: 'ORDER_CONFIRM',
      template: 'Hello {nama}, thank you for your order! 🙏\n\nOrder #{order_id}\nTotal: {total}\n\nShipping address: {alamat}\n\nWe will process your order soon.',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Pesanan Dikirim',
      language: 'ID',
      category: 'SHIPPING',
      template: 'Halo {nama}, pesanan Anda #{order_id} sudah dikirim! 📦\n\nResi: [RESI]\nEstimasi sampai: 1-2 hari\n\nTerima kasih! 😊',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: generateId(),
      shopId: defaultShop.id,
      name: 'Auto Reply - Tutup',
      language: 'ID',
      category: 'AUTO_REPLY',
      template: 'Halo! Maaf kami sedang tutup. ⏰\n\nJam operasional:\nSenin-Sabtu: 09.00-21.00\n\nPesanan Anda akan kami balas saat jam buka. Terima kasih! 🙏',
      createdAt: now(),
      updatedAt: now(),
    },
  ];

  await db.messageTemplates.bulkAdd(templates);

  // Seed operating hours
  const operatingHours: OperatingHours[] = [];
  for (let day = 1; day <= 6; day++) { // Monday to Saturday
    operatingHours.push({
      id: generateId(),
      shopId: defaultShop.id,
      dayOfWeek: day,
      openTime: '09:00',
      closeTime: '21:00',
      isOpen: true,
      createdAt: now(),
      updatedAt: now(),
    });
  }
  // Sunday closed
  operatingHours.push({
    id: generateId(),
    shopId: defaultShop.id,
    dayOfWeek: 0,
    openTime: '09:00',
    closeTime: '21:00',
    isOpen: false,
    createdAt: now(),
    updatedAt: now(),
  });

  await db.operatingHours.bulkAdd(operatingHours);

  // Seed sample order
  const orderNumber = `WW${Date.now().toString().slice(-8)}`;
  const sampleOrder: Order = {
    id: generateId(),
    orderNumber,
    shopId: defaultShop.id,
    customerId: customers[0].id,
    status: 'BARU',
    paymentStatus: 'BELUM_BAYAR',
    priority: 'NORMAL',
    subtotal: 15000,
    shippingCost: 10000,
    discount: 0,
    total: 25000,
    customerName: customers[0].name,
    customerPhone: customers[0].phone,
    shippingAddress: customers[0].address,
    shippingAreaId: shippingAreas[0].id,
    notes: 'Pesanan pertama',
    createdBy: 'Admin',
    createdAt: now(),
    updatedAt: now(),
  };

  await db.orders.add(sampleOrder);

  // Seed order items
  const orderItems: OrderItem[] = [
    {
      id: generateId(),
      orderId: sampleOrder.id,
      productId: products[0].id,
      productName: products[0].name,
      price: 15000,
      quantity: 1,
      subtotal: 15000,
      createdAt: now(),
    },
  ];

  await db.orderItems.bulkAdd(orderItems);

  // Seed order history
  const orderHistory: OrderStatusHistory[] = [
    {
      id: generateId(),
      orderId: sampleOrder.id,
      status: 'BARU',
      changedBy: 'Admin',
      notes: 'Pesanan dibuat',
      createdAt: now(),
    },
  ];

  await db.orderStatusHistory.bulkAdd(orderHistory);

  console.log('✅ Initial data seeded successfully');
};
