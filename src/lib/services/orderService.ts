import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/schema';
import type { Order, OrderItem, OrderStatus, OrderStatusHistory, PaymentStatus, PaymentMethod } from '../../types';

export interface CreateOrderInput {
  shopId: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: Array<{
    productId: string;
    productName: string;
    variantInfo?: string;
    quantity: number;
    price: number;
  }>;
  shippingCost: number;
  discount: number;
  notes?: string;
  priority?: 'NORMAL' | 'URGENT';
  paymentMethod?: PaymentMethod;
}

export interface UpdateOrderInput {
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  shippingCost?: number;
  discount?: number;
  notes?: string;
  priority?: 'NORMAL' | 'URGENT';
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export const orderService = {
  async getAll(shopId: string) {
    return await db.orders
      .where('shopId')
      .equals(shopId)
      .reverse()
      .sortBy('createdAt');
  },

  async getById(orderId: string) {
    return await db.orders.get(orderId);
  },

  async getOrderItems(orderId: string) {
    return await db.orderItems
      .where('orderId')
      .equals(orderId)
      .toArray();
  },

  async getOrderHistory(orderId: string) {
    return await db.orderStatusHistory
      .where('orderId')
      .equals(orderId)
      .reverse()
      .sortBy('createdAt');
  },

  async getByCustomer(customerId: string) {
    return await db.orders
      .where('customerId')
      .equals(customerId)
      .reverse()
      .sortBy('createdAt');
  },

  async getByStatus(shopId: string, status: OrderStatus) {
    return await db.orders
      .where(['shopId', 'status'])
      .equals([shopId, status])
      .reverse()
      .sortBy('createdAt');
  },

  async create(input: CreateOrderInput, createdBy: string) {
    const now = new Date();
    const orderId = uuidv4();

    const subtotal = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const total = subtotal + input.shippingCost - input.discount;

    const order: Order = {
      id: orderId,
      shopId: input.shopId,
      customerId: input.customerId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      status: 'NEW',
      paymentStatus: 'UNPAID',
      paymentMethod: input.paymentMethod,
      subtotal,
      shippingCost: input.shippingCost,
      discount: input.discount,
      total,
      notes: input.notes,
      priority: input.priority || 'NORMAL',
      createdAt: now,
      updatedAt: now,
    };

    await db.orders.add(order);

    const orderItems: OrderItem[] = input.items.map((item) => ({
      id: uuidv4(),
      orderId,
      productId: item.productId,
      productName: item.productName,
      variantInfo: item.variantInfo,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
      createdAt: now,
    }));

    await db.orderItems.bulkAdd(orderItems);

    const history: OrderStatusHistory = {
      id: uuidv4(),
      orderId,
      status: 'NEW',
      changedBy: createdBy,
      createdAt: now,
    };

    await db.orderStatusHistory.add(history);

    await db.activityLogs.add({
      id: uuidv4(),
      shopId: input.shopId,
      action: 'CREATE_ORDER',
      entityType: 'order',
      entityId: orderId,
      details: `Order ${orderId.substring(0, 8)} created`,
      performedBy: createdBy,
      createdAt: now,
    });

    return order;
  },

  async update(orderId: string, input: UpdateOrderInput, updatedBy: string) {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date();

    let newTotal = order.subtotal;
    if (input.shippingCost !== undefined) {
      newTotal += input.shippingCost;
    } else {
      newTotal += order.shippingCost;
    }
    if (input.discount !== undefined) {
      newTotal -= input.discount;
    } else {
      newTotal -= order.discount;
    }

    const updatedOrder: Order = {
      ...order,
      ...input,
      total: newTotal,
      updatedAt: now,
    };

    await db.orders.put(updatedOrder);

    await db.activityLogs.add({
      id: uuidv4(),
      shopId: order.shopId,
      action: 'UPDATE_ORDER',
      entityType: 'order',
      entityId: orderId,
      details: `Order ${orderId.substring(0, 8)} updated`,
      performedBy: updatedBy,
      createdAt: now,
    });

    return updatedOrder;
  },

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    changedBy: string,
    notes?: string
  ) {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date();

    await db.orders.update(orderId, {
      status,
      updatedAt: now,
    });

    const history: OrderStatusHistory = {
      id: uuidv4(),
      orderId,
      status,
      changedBy,
      notes,
      createdAt: now,
    };

    await db.orderStatusHistory.add(history);

    await db.activityLogs.add({
      id: uuidv4(),
      shopId: order.shopId,
      action: 'UPDATE_ORDER_STATUS',
      entityType: 'order',
      entityId: orderId,
      details: `Order ${orderId.substring(0, 8)} status changed to ${status}`,
      performedBy: changedBy,
      createdAt: now,
    });

    return { ...order, status, updatedAt: now };
  },

  async delete(orderId: string, deletedBy: string) {
    const order = await db.orders.get(orderId);
    if (!order) throw new Error('Order not found');

    await db.orders.delete(orderId);
    await db.orderItems.where('orderId').equals(orderId).delete();
    await db.orderStatusHistory.where('orderId').equals(orderId).delete();
    await db.payments.where('orderId').equals(orderId).delete();
    await db.reminders.where('orderId').equals(orderId).delete();

    await db.activityLogs.add({
      id: uuidv4(),
      shopId: order.shopId,
      action: 'DELETE_ORDER',
      entityType: 'order',
      entityId: orderId,
      details: `Order ${orderId.substring(0, 8)} deleted`,
      performedBy: deletedBy,
      createdAt: new Date(),
    });
  },
};
