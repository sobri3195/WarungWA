import Dexie from 'dexie';
import type { Table } from 'dexie';
import type {
  Shop,
  AppSession,
  Category,
  Product,
  ProductVariant,
  Customer,
  CustomerTag,
  CustomerTagJoin,
  PriceLevel,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  ShippingArea,
  MessageTemplate,
  Reminder,
  ActivityLog,
  OrderTemplate,
} from '../../types';

export class WarungWADatabase extends Dexie {
  shops!: Table<Shop>;
  appSession!: Table<AppSession>;
  categories!: Table<Category>;
  products!: Table<Product>;
  productVariants!: Table<ProductVariant>;
  customers!: Table<Customer>;
  customerTags!: Table<CustomerTag>;
  customerTagJoin!: Table<CustomerTagJoin>;
  priceLevels!: Table<PriceLevel>;
  orders!: Table<Order>;
  orderItems!: Table<OrderItem>;
  orderStatusHistory!: Table<OrderStatusHistory>;
  payments!: Table<Payment>;
  shippingAreas!: Table<ShippingArea>;
  messageTemplates!: Table<MessageTemplate>;
  reminders!: Table<Reminder>;
  activityLogs!: Table<ActivityLog>;
  orderTemplates!: Table<OrderTemplate>;

  constructor() {
    super('WarungWADB');
    
    this.version(1).stores({
      shops: 'id, name',
      appSession: 'id',
      categories: 'id, shopId, name',
      products: 'id, shopId, categoryId, name, isActive',
      productVariants: 'id, productId',
      customers: 'id, shopId, phone, name, level',
      customerTags: 'id, shopId, name',
      customerTagJoin: 'id, customerId, tagId',
      priceLevels: 'id, shopId, productId, level',
      orders: 'id, shopId, customerId, status, paymentStatus, createdAt',
      orderItems: 'id, orderId, productId',
      orderStatusHistory: 'id, orderId, createdAt',
      payments: 'id, orderId',
      shippingAreas: 'id, shopId, name',
      messageTemplates: 'id, shopId, language, name',
      reminders: 'id, orderId, dueDate, isCompleted',
      activityLogs: 'id, shopId, entityType, entityId, createdAt',
      orderTemplates: 'id, shopId, name',
    });
  }
}

export const db = new WarungWADatabase();
