import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { db, type Customer, type Order, type Product, generateId, now } from './db';
import { formatCurrency } from './whatsapp';

// ============================================================
// JSON BACKUP/RESTORE
// ============================================================

export interface BackupData {
  version: string;
  timestamp: string;
  shops: any[];
  categories: any[];
  products: any[];
  productVariants: any[];
  customers: any[];
  customerTags: any[];
  customerTagJoin: any[];
  orders: any[];
  orderItems: any[];
  orderStatusHistory: any[];
  payments: any[];
  shippingAreas: any[];
  messageTemplates: any[];
  reminders: any[];
  operatingHours: any[];
  quickCartTemplates: any[];
  customerLevelPricing: any[];
}

/**
 * Export all data to JSON backup
 */
export const exportToJSON = async (shopId: string): Promise<BackupData> => {
  const backup: BackupData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    shops: await db.shops.where('id').equals(shopId).toArray(),
    categories: await db.categories.where('shopId').equals(shopId).toArray(),
    products: await db.products.where('shopId').equals(shopId).toArray(),
    productVariants: [],
    customers: await db.customers.where('shopId').equals(shopId).toArray(),
    customerTags: await db.customerTags.where('shopId').equals(shopId).toArray(),
    customerTagJoin: [],
    orders: await db.orders.where('shopId').equals(shopId).toArray(),
    orderItems: [],
    orderStatusHistory: [],
    payments: [],
    shippingAreas: await db.shippingAreas.where('shopId').equals(shopId).toArray(),
    messageTemplates: await db.messageTemplates.where('shopId').equals(shopId).toArray(),
    reminders: await db.reminders.where('shopId').equals(shopId).toArray(),
    operatingHours: await db.operatingHours.where('shopId').equals(shopId).toArray(),
    quickCartTemplates: await db.quickCartTemplates.where('shopId').equals(shopId).toArray(),
    customerLevelPricing: await db.customerLevelPricing.where('shopId').equals(shopId).toArray(),
  };

  // Get product variants
  const productIds = backup.products.map(p => p.id);
  backup.productVariants = await db.productVariants
    .where('productId')
    .anyOf(productIds)
    .toArray();

  // Get customer tag joins
  const customerIds = backup.customers.map(c => c.id);
  backup.customerTagJoin = await db.customerTagJoin
    .where('customerId')
    .anyOf(customerIds)
    .toArray();

  // Get order items and history
  const orderIds = backup.orders.map(o => o.id);
  backup.orderItems = await db.orderItems.where('orderId').anyOf(orderIds).toArray();
  backup.orderStatusHistory = await db.orderStatusHistory.where('orderId').anyOf(orderIds).toArray();
  backup.payments = await db.payments.where('orderId').anyOf(orderIds).toArray();

  return backup;
};

/**
 * Import data from JSON backup with merge option
 */
export const importFromJSON = async (
  backup: BackupData,
  options: { merge: boolean; shopId: string }
): Promise<{ success: boolean; message: string; stats: any }> => {
  try {
    const stats = {
      products: 0,
      customers: 0,
      orders: 0,
      skipped: 0,
    };

    // Import categories
    for (const category of backup.categories) {
      const existing = await db.categories.get(category.id);
      if (!existing || !options.merge) {
        await db.categories.put({ ...category, shopId: options.shopId });
      }
    }

    // Import products
    for (const product of backup.products) {
      const existing = await db.products.get(product.id);
      if (!existing || !options.merge) {
        await db.products.put({ ...product, shopId: options.shopId });
        stats.products++;
      } else {
        stats.skipped++;
      }
    }

    // Import product variants
    for (const variant of backup.productVariants) {
      const existing = await db.productVariants.get(variant.id);
      if (!existing || !options.merge) {
        await db.productVariants.put(variant);
      }
    }

    // Import customers (check duplicates by phone)
    for (const customer of backup.customers) {
      if (options.merge) {
        const existing = await db.customers
          .where('phone')
          .equals(customer.phone)
          .and(c => c.shopId === options.shopId)
          .first();
        
        if (existing) {
          stats.skipped++;
          continue;
        }
      }
      
      await db.customers.put({ ...customer, shopId: options.shopId });
      stats.customers++;
    }

    // Import customer tags
    for (const tag of backup.customerTags) {
      const existing = await db.customerTags.get(tag.id);
      if (!existing || !options.merge) {
        await db.customerTags.put({ ...tag, shopId: options.shopId });
      }
    }

    // Import customer tag joins
    for (const join of backup.customerTagJoin) {
      const existing = await db.customerTagJoin.get(join.id);
      if (!existing || !options.merge) {
        await db.customerTagJoin.put(join);
      }
    }

    // Import orders
    for (const order of backup.orders) {
      if (options.merge) {
        const existing = await db.orders
          .where('orderNumber')
          .equals(order.orderNumber)
          .first();
        
        if (existing) {
          stats.skipped++;
          continue;
        }
      }
      
      await db.orders.put({ ...order, shopId: options.shopId });
      stats.orders++;
    }

    // Import order items
    for (const item of backup.orderItems) {
      await db.orderItems.put(item);
    }

    // Import order history
    for (const history of backup.orderStatusHistory) {
      await db.orderStatusHistory.put(history);
    }

    // Import payments
    for (const payment of backup.payments) {
      await db.payments.put(payment);
    }

    // Import shipping areas
    for (const area of backup.shippingAreas) {
      const existing = await db.shippingAreas.get(area.id);
      if (!existing || !options.merge) {
        await db.shippingAreas.put({ ...area, shopId: options.shopId });
      }
    }

    // Import message templates
    for (const template of backup.messageTemplates) {
      const existing = await db.messageTemplates.get(template.id);
      if (!existing || !options.merge) {
        await db.messageTemplates.put({ ...template, shopId: options.shopId });
      }
    }

    // Import reminders
    for (const reminder of backup.reminders) {
      await db.reminders.put({ ...reminder, shopId: options.shopId });
    }

    // Import operating hours
    for (const hours of backup.operatingHours) {
      const existing = await db.operatingHours.get(hours.id);
      if (!existing || !options.merge) {
        await db.operatingHours.put({ ...hours, shopId: options.shopId });
      }
    }

    // Import quick cart templates
    for (const template of backup.quickCartTemplates) {
      await db.quickCartTemplates.put({ ...template, shopId: options.shopId });
    }

    // Import customer level pricing
    for (const pricing of backup.customerLevelPricing) {
      const existing = await db.customerLevelPricing.get(pricing.id);
      if (!existing || !options.merge) {
        await db.customerLevelPricing.put({ ...pricing, shopId: options.shopId });
      }
    }

    return {
      success: true,
      message: 'Import berhasil',
      stats,
    };
  } catch (error) {
    console.error('Import error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Import gagal',
      stats: {},
    };
  }
};

/**
 * Download JSON file
 */
export const downloadJSON = (data: any, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
};

// ============================================================
// EXCEL EXPORT
// ============================================================

/**
 * Export customers to Excel
 */
export const exportCustomersToExcel = async (shopId: string): Promise<void> => {
  const customers = await db.customers.where('shopId').equals(shopId).toArray();
  
  const data = customers.map(c => ({
    'Nama': c.name,
    'WhatsApp': c.phone,
    'Email': c.email || '',
    'Alamat': c.address || '',
    'Level': c.level,
    'Catatan': c.notes || '',
    'Tanggal Daftar': new Date(c.createdAt).toLocaleDateString('id-ID'),
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');
  
  XLSX.writeFile(wb, `Customers-${Date.now()}.xlsx`);
};

/**
 * Export orders to Excel
 */
export const exportOrdersToExcel = async (
  shopId: string,
  filters?: { status?: string; dateFrom?: string; dateTo?: string }
): Promise<void> => {
  let query = db.orders.where('shopId').equals(shopId);
  
  let orders = await query.toArray();
  
  // Apply filters
  if (filters?.status) {
    orders = orders.filter(o => o.status === filters.status);
  }
  
  if (filters?.dateFrom) {
    orders = orders.filter(o => o.createdAt >= filters.dateFrom!);
  }
  
  if (filters?.dateTo) {
    orders = orders.filter(o => o.createdAt <= filters.dateTo!);
  }
  
  const data = orders.map(o => ({
    'No. Pesanan': o.orderNumber,
    'Pelanggan': o.customerName,
    'WhatsApp': o.customerPhone,
    'Status': o.status,
    'Status Bayar': o.paymentStatus,
    'Prioritas': o.priority,
    'Subtotal': o.subtotal,
    'Ongkir': o.shippingCost,
    'Diskon': o.discount,
    'Total': o.total,
    'Tanggal': new Date(o.createdAt).toLocaleDateString('id-ID'),
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  
  XLSX.writeFile(wb, `Orders-${Date.now()}.xlsx`);
};

/**
 * Export products to Excel
 */
export const exportProductsToExcel = async (shopId: string): Promise<void> => {
  const products = await db.products.where('shopId').equals(shopId).toArray();
  const categories = await db.categories.where('shopId').equals(shopId).toArray();
  
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  
  const data = products.map(p => ({
    'SKU': p.sku || '',
    'Nama': p.name,
    'Kategori': p.categoryId ? categoryMap.get(p.categoryId) : '',
    'Harga': p.basePrice,
    'Deskripsi': p.description || '',
    'Status': p.isActive ? 'Aktif' : 'Nonaktif',
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  
  XLSX.writeFile(wb, `Products-${Date.now()}.xlsx`);
};

// ============================================================
// CSV EXPORT
// ============================================================

/**
 * Export any data to CSV
 */
export const exportToCSV = (data: any[], filename: string): void => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Export customers to CSV
 */
export const exportCustomersToCSV = async (shopId: string): Promise<void> => {
  const customers = await db.customers.where('shopId').equals(shopId).toArray();
  
  const data = customers.map(c => ({
    nama: c.name,
    whatsapp: c.phone,
    email: c.email || '',
    alamat: c.address || '',
    level: c.level,
    catatan: c.notes || '',
  }));
  
  exportToCSV(data, `Customers-${Date.now()}.csv`);
};

// ============================================================
// CSV IMPORT
// ============================================================

export interface ProductImportRow {
  sku?: string;
  nama: string;
  kategori?: string;
  harga: number;
  deskripsi?: string;
  status?: string;
}

/**
 * Import products from CSV
 */
export const importProductsFromCSV = async (
  file: File,
  shopId: string
): Promise<{ success: boolean; message: string; count: number }> => {
  return new Promise((resolve) => {
    Papa.parse<ProductImportRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          let count = 0;
          
          for (const row of results.data) {
            if (!row.nama || !row.harga) {
              continue;
            }
            
            // Find or create category
            let categoryId: string | undefined;
            if (row.kategori) {
              let category = await db.categories
                .where('name')
                .equals(row.kategori)
                .and(c => c.shopId === shopId)
                .first();
              
              if (!category) {
                category = {
                  id: generateId(),
                  shopId,
                  name: row.kategori,
                  createdAt: now(),
                  updatedAt: now(),
                };
                await db.categories.add(category);
              }
              
              categoryId = category.id;
            }
            
            // Create product
            const product: Product = {
              id: generateId(),
              shopId,
              categoryId,
              sku: row.sku,
              name: row.nama,
              description: row.deskripsi,
              basePrice: Number(row.harga),
              isActive: row.status?.toLowerCase() !== 'nonaktif',
              createdAt: now(),
              updatedAt: now(),
            };
            
            await db.products.add(product);
            count++;
          }
          
          resolve({
            success: true,
            message: `Berhasil import ${count} produk`,
            count,
          });
        } catch (error) {
          resolve({
            success: false,
            message: error instanceof Error ? error.message : 'Import gagal',
            count: 0,
          });
        }
      },
      error: (error) => {
        resolve({
          success: false,
          message: error.message,
          count: 0,
        });
      },
    });
  });
};
