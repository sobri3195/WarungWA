import { v4 as uuidv4 } from 'uuid';
import { db } from './schema';
import type { Shop, AppSession, Category, Product, Customer, MessageTemplate, ShippingArea } from '../../types';

export async function seedDatabase() {
  const sessionCount = await db.appSession.count();
  if (sessionCount > 0) {
    return;
  }

  const now = new Date();

  const defaultShop: Shop = {
    id: uuidv4(),
    name: 'Warung Kita',
    description: 'UMKM Berkah',
    phone: '628123456789',
    address: 'Jl. Merdeka No. 123, Jakarta',
    operatingHours: {
      enabled: true,
      start: '09:00',
      end: '21:00',
      outsideHoursMessage: 'Maaf, kami sedang tutup. Jam operasional: 09:00 - 21:00. Silakan hubungi kami saat jam buka. Terima kasih! 🙏',
      busyMessage: 'Mohon maaf, saat ini kami sedang sibuk. Kami akan merespons sesegera mungkin. Terima kasih atas kesabarannya! 🙏',
    },
    createdAt: now,
    updatedAt: now,
  };

  await db.shops.add(defaultShop);

  const session: AppSession = {
    id: 'main',
    currentShopId: defaultShop.id,
    currentRole: 'OWNER',
    userName: 'Admin',
    updatedAt: now,
  };

  await db.appSession.add(session);

  const categories: Category[] = [
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Makanan',
      description: 'Produk makanan',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Minuman',
      description: 'Produk minuman',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Snack',
      description: 'Produk snack',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.categories.bulkAdd(categories);

  const products: Product[] = [
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      categoryId: categories[0].id,
      name: 'Nasi Goreng Spesial',
      description: 'Nasi goreng dengan telur, ayam, dan sayuran',
      price: 25000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      categoryId: categories[0].id,
      name: 'Mie Goreng',
      description: 'Mie goreng pedas dengan topping lengkap',
      price: 20000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      categoryId: categories[1].id,
      name: 'Es Teh Manis',
      description: 'Es teh segar',
      price: 5000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      categoryId: categories[1].id,
      name: 'Jus Jeruk',
      description: 'Jus jeruk segar tanpa gula',
      price: 12000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      categoryId: categories[2].id,
      name: 'Keripik Singkong',
      description: 'Keripik singkong renyah',
      price: 15000,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.products.bulkAdd(products);

  const customers: Customer[] = [
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Budi Santoso',
      phone: '628123456001',
      address: 'Jl. Sudirman No. 10, Jakarta',
      level: 'RETAIL',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Siti Rahayu',
      phone: '628123456002',
      address: 'Jl. Gatot Subroto No. 25, Jakarta',
      level: 'RESELLER',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Ahmad Fadli',
      phone: '628123456003',
      address: 'Jl. Thamrin No. 5, Jakarta',
      level: 'WHOLESALE',
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.customers.bulkAdd(customers);

  const shippingAreas: ShippingArea[] = [
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Jakarta Pusat',
      cost: 10000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Jakarta Selatan',
      cost: 15000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Jakarta Barat',
      cost: 12000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Jakarta Utara',
      cost: 15000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Jakarta Timur',
      cost: 12000,
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.shippingAreas.bulkAdd(shippingAreas);

  const messageTemplates: MessageTemplate[] = [
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Konfirmasi Pesanan',
      language: 'ID',
      subject: 'Konfirmasi Pesanan',
      content: `Halo {nama}! 👋

Terima kasih sudah order di {toko}!

📋 *Detail Pesanan:*
Order ID: {order_id}
Total: Rp {total}

Pesanan Anda sedang kami proses. Akan kami kabarkan jika sudah siap dikirim ya!

Terima kasih! 🙏`,
      variables: ['{nama}', '{toko}', '{order_id}', '{total}'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Pesanan Dikirim',
      language: 'ID',
      subject: 'Pesanan Dikirim',
      content: `Halo {nama}! 📦

Kabar baik! Pesanan Anda sudah dikirim.

📋 *Detail Pengiriman:*
Order ID: {order_id}
Alamat: {alamat}

Estimasi sampai: 1-2 hari kerja

Terima kasih sudah berbelanja di {toko}! 🙏`,
      variables: ['{nama}', '{order_id}', '{alamat}', '{toko}'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Invoice',
      language: 'ID',
      subject: 'Invoice',
      content: `*INVOICE*

Order ID: {order_id}
Tanggal: {tanggal}
Customer: {nama}

📝 *Detail:*
{items}

Subtotal: Rp {subtotal}
Ongkir: Rp {ongkir}
Diskon: Rp {diskon}
*Total: Rp {total}*

Terima kasih! 🙏
{toko}`,
      variables: ['{order_id}', '{tanggal}', '{nama}', '{items}', '{subtotal}', '{ongkir}', '{diskon}', '{total}', '{toko}'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      shopId: defaultShop.id,
      name: 'Order Confirmation',
      language: 'EN',
      subject: 'Order Confirmation',
      content: `Hello {nama}! 👋

Thank you for your order at {toko}!

📋 *Order Details:*
Order ID: {order_id}
Total: Rp {total}

We're processing your order. We'll notify you when it's ready for delivery!

Thank you! 🙏`,
      variables: ['{nama}', '{toko}', '{order_id}', '{total}'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  await db.messageTemplates.bulkAdd(messageTemplates);

  console.log('✅ Database seeded successfully!');
}
