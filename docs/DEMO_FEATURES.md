# 🎯 WarungWA - Demo Fitur & Contoh Penggunaan

## 📱 Screenshot Flow User Journey

### 1. Login Page
- Pilih/input nama Anda
- Pilih toko (default: "Warung Kita")
- Pilih role demo (Owner/Admin/Staff)
- Klik "Masuk ke Dashboard"

### 2. Dashboard
**Fitur yang tampil:**
- 4 kartu statistik:
  - Total Pesanan
  - Pesanan Baru  
  - Pesanan Selesai
  - Omzet (dari pesanan selesai)
- Grafik omzet 7 hari terakhir (menggunakan Recharts)
- Daftar produk terlaris (top 5)
- Pesanan terbaru (5 terakhir)
- Reminder hari ini (jika ada)

**Demo Scenario:**
- Lihat overview bisnis sekilas
- Klik pesanan terbaru untuk melihat detail
- Monitor produk terlaris

### 3. Pesanan (Orders)
**Fitur yang tampil:**
- Toggle view: Kanban Board / List View
- Search bar (cari nama, HP, order ID)
- Tombol "Buat Pesanan"

#### 3a. Kanban Board View
**5 kolom status:**
1. Baru (biru)
2. Konfirmasi (kuning)
3. Dikemas (ungu)
4. Dikirim (orange)
5. Selesai (hijau)

**Fitur Drag & Drop:**
- Drag kartu pesanan antar kolom
- Status otomatis update
- Activity log tercatat
- Toast notification muncul

**Kartu Order menampilkan:**
- Order ID (8 karakter)
- Nama & nomor HP pelanggan
- Total pesanan
- Status pembayaran (badge berwarna)
- Label prioritas (jika urgent)
- Tanggal & waktu order

**Demo Scenario:**
- Drag order dari "Baru" ke "Konfirmasi"
- Lihat toast notification
- Klik kartu untuk melihat detail

#### 3b. List View
Table dengan kolom:
- Order ID
- Pelanggan (nama + HP)
- Total
- Status (badge berwarna)
- Tanggal

**Demo Scenario:**
- Sort by date
- Search customer name
- Klik row untuk detail

### 4. Detail Pesanan (Order Detail) - Coming Soon
**Akan tampil:**
- Info customer lengkap
- Daftar item (produk + qty + harga)
- Subtotal, ongkir, diskon, total
- Status pembayaran & metode
- History perubahan status
- Activity log

**Actions:**
- Ubah status manual
- Update pembayaran
- Edit order items
- Generate Invoice PDF
- Kirim WA ke customer (dengan template)

### 5. Produk (Products) - Coming Soon
**Fitur:**
- List produk dengan kategori
- CRUD produk
- Manage variants (ukuran, warna, dll)
- Toggle active/inactive
- Import CSV produk
- Price level per customer tier

### 6. Pelanggan (Customers) - Coming Soon
**Fitur:**
- List customer dengan search
- CRUD customer
- Tag management
- Customer level (Retail/Reseller/Wholesale)
- History pesanan per customer
- Deteksi duplikat nomor HP

### 7. Template Chat (Message Templates) - Coming Soon
**Fitur:**
- CRUD template pesan
- Multi-bahasa (ID/EN)
- Variable replacement:
  - {nama}, {phone}, {order_id}
  - {total}, {subtotal}, {ongkir}
  - {alamat}, {tanggal}, {toko}
- Preview template
- Quick action "Test Template"

### 8. Laporan (Reports) - Coming Soon
**Fitur:**
- Analytics omzet
- Grafik tren penjualan
- Produk terlaris (detail)
- Customer terbanyak order
- Filter by date range
- Export to Excel/CSV

### 9. Pengaturan (Settings) - Coming Soon
**Fitur:**
- **Toko:**
  - Edit profil toko
  - Logo upload
  - Jam operasional
  - Auto-reply message
- **Multi-Toko:**
  - Buat toko baru
  - Switch antar toko
- **Ongkir:**
  - CRUD area pengiriman
  - Set tarif per area
- **Export/Import:**
  - Export full data (JSON)
  - Export customers (Excel/CSV)
  - Export orders (Excel/CSV)
  - Import JSON (merge)
  - Import products (CSV)
- **Role Management:**
  - Switch role (demo)
  - Activity log

---

## 🎭 Contoh Use Case Demo

### Use Case 1: Warung Makan (F&B)
**Flow:**
1. Login sebagai Owner
2. Dashboard: lihat omzet hari ini
3. Pesanan Baru masuk → drag ke "Konfirmasi"
4. Klik detail → Generate invoice PDF
5. Kirim WA ke customer dengan template konfirmasi
6. Setelah dikirim → drag ke "Dikirim"
7. Customer confirm → drag ke "Selesai"

**Sample Products:**
- Nasi Goreng Spesial (variants: level pedas)
- Mie Goreng (variants: level pedas)
- Es Teh Manis
- Jus Jeruk

### Use Case 2: Reseller Fashion
**Flow:**
1. Customer order via WA
2. Input pesanan manual di "Buat Pesanan"
3. Pilih produk dari katalog
4. Set level customer: Reseller (dapat diskon)
5. Ongkir auto-hit berdasarkan area
6. Generate invoice & send WA
7. Track status: Baru → Konfirmasi → Dikemas → Dikirim → Selesai
8. Set reminder follow-up

**Sample Products:**
- Kaos Polos (variants: S, M, L, XL)
- Celana Jeans (variants: 28, 30, 32, 34)
- Jaket Hoodie (variants: M, L, XL)

### Use Case 3: Toko Kue
**Flow:**
1. Customer order kue custom via WA
2. Input order dengan custom notes
3. Set prioritas: URGENT (order mendadak)
4. Track di Kanban: Baru → Dikemas (skip konfirmasi)
5. Upload foto kue jadi (notes)
6. Kirim WA: "Kue sudah jadi!"
7. COD → update payment: Lunas

**Sample Products:**
- Brownies (variants: 20x20, 30x30)
- Kue Ultah (variants: 1kg, 2kg, 3kg)
- Cookies (variants: 250g, 500g, 1kg)

---

## 💬 Contoh Template WhatsApp

### Template 1: Konfirmasi Pesanan
```
Halo {nama}! 👋

Terima kasih sudah order di {toko}!

📋 *Detail Pesanan:*
Order ID: {order_id}
Total: Rp {total}

Pesanan Anda sedang kami proses. Akan kami kabarkan jika sudah siap dikirim ya!

Terima kasih! 🙏
```

**Variables replaced:**
- {nama} → "Budi Santoso"
- {toko} → "Warung Kita"
- {order_id} → "A3B4C5D6"
- {total} → "75.000"

**Generated Link:**
```
https://wa.me/628123456001?text=Halo%20Budi%20Santoso!%20...
```

### Template 2: Pesanan Dikirim
```
Halo {nama}! 📦

Kabar baik! Pesanan Anda sudah dikirim.

📋 *Detail Pengiriman:*
Order ID: {order_id}
Alamat: {alamat}

Estimasi sampai: 1-2 hari kerja

Terima kasih sudah berbelanja di {toko}! 🙏
```

### Template 3: Invoice
```
*INVOICE*

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
{toko}
```

---

## 📊 Data Yang Sudah Di-seed (Sample Data)

### Toko:
- **Warung Kita**
  - WhatsApp: 628123456789
  - Alamat: Jl. Merdeka No. 123, Jakarta
  - Jam Operasional: 09:00 - 21:00

### Kategori:
1. Makanan
2. Minuman
3. Snack

### Produk (5 items):
1. Nasi Goreng Spesial - Rp 25.000
2. Mie Goreng - Rp 20.000
3. Es Teh Manis - Rp 5.000
4. Jus Jeruk - Rp 12.000
5. Keripik Singkong - Rp 15.000

### Pelanggan (3):
1. Budi Santoso (628123456001) - Retail
2. Siti Rahayu (628123456002) - Reseller
3. Ahmad Fadli (628123456003) - Wholesale

### Area Ongkir:
1. Jakarta Pusat - Rp 10.000
2. Jakarta Selatan - Rp 15.000
3. Jakarta Barat - Rp 12.000
4. Jakarta Utara - Rp 15.000
5. Jakarta Timur - Rp 12.000

### Template Chat (4):
1. Konfirmasi Pesanan (ID)
2. Pesanan Dikirim (ID)
3. Invoice (ID)
4. Order Confirmation (EN)

---

## 🚀 Quick Start Demo

```bash
# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# 3. Open browser
http://localhost:5173

# 4. Login
- Nama: "Demo User"
- Toko: "Warung Kita" (default)
- Role: "Owner"

# 5. Explore!
- Dashboard → lihat stats
- Pesanan → drag & drop di Kanban
- Klik kartu order → lihat detail (coming soon)
```

---

## 🔧 Tech Features Showcase

### 1. IndexedDB dengan Dexie.js
```typescript
// Query orders
const orders = await db.orders
  .where('shopId')
  .equals(currentShopId)
  .reverse()
  .sortBy('createdAt');
```

### 2. Drag & Drop dengan dnd-kit
```typescript
<DndContext onDragEnd={handleDragEnd}>
  <OrderKanban orders={orders} />
</DndContext>
```

### 3. PDF Generation dengan @react-pdf/renderer
```typescript
const doc = <InvoiceDocument order={order} />;
const blob = await pdf(doc).toBlob();
downloadInvoice(blob, orderId);
```

### 4. WhatsApp Click-to-Chat
```typescript
const link = generateWhatsAppLink(
  customer.phone,
  replaceTemplateVariables(template, variables)
);
window.open(link, '_blank');
```

### 5. Charts dengan Recharts
```typescript
<BarChart data={revenueData}>
  <Bar dataKey="revenue" fill="#22c55e" />
</BarChart>
```

---

**Enjoy exploring WarungWA! 🎉**
