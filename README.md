# 📱 WarungWA

> **Kelola katalog, pelanggan, dan pesanan — langsung closing lewat WhatsApp.**

Aplikasi web untuk UMKM (toko online kecil, reseller, F&B) yang membantu mengelola katalog produk, pelanggan, pipeline pesanan, dan template chat WhatsApp agar proses closing lebih cepat.

**🎯 100% Frontend-Only | ⚡ Offline-First | 🚀 Deploy ke Vercel dalam 5 Menit**

![WarungWA](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-5-purple) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

---

## ✨ Fitur Utama

### 🛍️ Katalog Produk
- ✅ CRUD produk lengkap (nama, harga, kategori, deskripsi)
- ✅ Varian produk dengan harga adjustment (ukuran, level pedas, dll)
- ✅ Status aktif/nonaktif per produk
- ✅ Pencarian & filter kategori
- ✅ Import produk dari CSV

### 👥 CRM Pelanggan
- ✅ CRUD pelanggan (nama, nomor WA, catatan)
- ✅ Multi-tag untuk segmentasi
- ✅ Level pelanggan (Retail, Reseller, Grosir) dengan harga khusus
- ✅ Riwayat pesanan per pelanggan
- ✅ Deteksi duplikat nomor WhatsApp

### 📦 Pipeline Pesanan
- ✅ Status pipeline: Baru → Konfirmasi → Dikemas → Dikirim → Selesai
- ✅ Tampilan **Kanban Board** (drag & drop) + List view
- ✅ Detail pesanan lengkap (item, qty, ongkir, diskon)
- ✅ Status pembayaran (Belum Bayar, DP, Lunas)
- ✅ Prioritas pesanan (Normal/Urgent)
- ✅ Activity log (siapa ubah status & kapan)

### 💬 Template Chat WhatsApp
- ✅ Template pesan dengan variabel: `{nama}`, `{total}`, `{order_id}`, `{alamat}`
- ✅ Multi-bahasa (Indonesia/English)
- ✅ Quick actions: tombol **"Kirim WA"** buka `wa.me` otomatis
- ✅ Auto-reply berbasis jam operasional

### 📄 Invoice PDF
- ✅ Generate invoice dari data order
- ✅ Branding toko (nama, logo, alamat, WA)
- ✅ Download PDF langsung dari browser

### 📊 Analytics & Laporan
- ✅ Dashboard dengan statistik real-time
- ✅ Grafik omzet 7 hari terakhir
- ✅ Produk terlaris
- ✅ Export Excel/CSV (pelanggan, pesanan, produk)

### 🏪 Multi-Toko/Cabang
- ✅ Kelola beberapa toko dalam satu aplikasi
- ✅ Data terpisah per toko
- ✅ Switch toko dengan mudah

### ⚙️ Fitur Tambahan
- ✅ Manajemen ongkir per area
- ✅ Quick Cart & Template Order
- ✅ Reminder follow-up pesanan
- ✅ Multi-admin dengan role (Owner/Admin/Staff)
- ✅ Backup/Restore data (JSON export/import)
- ✅ Fully responsive UI

---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **TypeScript** | Type Safety |
| **Tailwind CSS** | Styling |
| **React Router** | Client-side Routing |
| **Zustand** | State Management |
| **Dexie.js** | IndexedDB Wrapper (Local Storage) |
| **@dnd-kit** | Drag & Drop Kanban |
| **React Hook Form + Zod** | Form Handling & Validation |
| **@react-pdf/renderer** | PDF Invoice Generation |
| **xlsx + papaparse** | Excel/CSV Export |
| **Recharts** | Charts & Analytics |

---

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

**🌐 Deploy to Vercel:**
```bash
vercel --prod
```

📖 **Full installation guide:** [docs/INSTALLATION.md](./docs/INSTALLATION.md)

---

## 🎨 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/2563eb/ffffff?text=Dashboard+View)

### Kanban Board
![Kanban](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=Kanban+Board)

### Order Detail + WhatsApp
![Order](https://via.placeholder.com/800x400/10b981/ffffff?text=Order+Detail)

---

## 📂 Project Structure

```
warungwa/
├── src/
│   ├── lib/
│   │   ├── db.ts              # Dexie schema & types
│   │   ├── store.ts           # Zustand stores
│   │   ├── whatsapp.ts        # WhatsApp helpers
│   │   ├── pdf-invoice.tsx    # PDF invoice component
│   │   └── export.ts          # Export/import helpers
│   ├── components/
│   │   ├── Layout.tsx         # Main layout
│   │   ├── DataTable.tsx      # Reusable data table
│   │   ├── KanbanBoard.tsx    # Kanban board
│   │   ├── Modal.tsx          # Modal system
│   │   └── Toast.tsx          # Toast notifications
│   ├── pages/
│   │   ├── Login.tsx          # Login page
│   │   ├── Dashboard.tsx      # Dashboard
│   │   ├── Orders.tsx         # Orders list + kanban
│   │   └── OrderDetail.tsx    # Order detail
│   ├── App.tsx                # Main app with routing
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind styles
├── docs/
│   └── INSTALLATION.md        # Installation guide
├── public/                    # Static assets
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🗄️ Data Storage

**100% Offline** - Data disimpan di browser menggunakan **IndexedDB**:

- ✅ Tidak butuh backend/server
- ✅ Data persisten di browser
- ✅ Backup/restore via JSON export
- ✅ Privacy terjaga (data tidak keluar browser)

---

## 📱 WhatsApp Integration

**PENTING:** Aplikasi ini menggunakan **Click-to-Chat** (`wa.me`) dan **TIDAK** menggunakan WhatsApp Business API resmi.

### Cara Kerja:
1. User klik tombol "Kirim WA" di order detail
2. Pilih template pesan (misal: Konfirmasi Pesanan)
3. Template otomatis terisi dengan data order:
   ```
   Halo {nama}, terima kasih sudah order! 🙏
   
   Pesanan #{order_id}
   Total: {total}
   Alamat: {alamat}
   
   Pesanan akan segera kami proses.
   ```
4. Browser membuka `wa.me/[nomor]?text=[pesan]`
5. WhatsApp terbuka dengan pesan siap kirim

### Auto-Reply (Suggested Reply)
- Jam operasional diatur di Settings
- Jika di luar jam, sistem menampilkan template auto-reply
- User tinggal copy/paste ke WhatsApp

---

## 🔐 Security & Privacy

- ✅ Data 100% disimpan lokal di browser
- ✅ Tidak ada transmisi data ke server
- ✅ Tidak perlu WhatsApp API credentials
- ✅ Tidak ada tracking/analytics eksternal
- ✅ Cocok untuk UMKM yang peduli privasi pelanggan

---

## 🎯 Use Cases

### Toko Online Kecil
- Kelola katalog produk
- Terima order via form/chat
- Kirim konfirmasi via WhatsApp
- Track status pengiriman

### Reseller/Dropshipper
- Atur level harga pelanggan
- Quick cart untuk order cepat
- Template pesan untuk closing
- Invoice otomatis

### Bisnis F&B
- Menu dengan varian (level pedas, ukuran)
- Ongkir per area pengiriman
- Reminder follow-up pelanggan
- Laporan produk terlaris

---

## 📈 Roadmap

- [ ] Import pelanggan dari CSV
- [ ] Label printer integration
- [ ] WhatsApp Business API integration (optional)
- [ ] Integrasi payment gateway (Midtrans, Xendit)
- [ ] Multi-currency support
- [ ] Advanced analytics & insights
- [ ] PWA dengan offline mode penuh
- [ ] Notification system

---

## 🤝 Contributing

Ini adalah proyek template/demo. Silakan fork dan modifikasi sesuai kebutuhan Anda!

---

## 📄 License

MIT License - Bebas digunakan untuk proyek komersial maupun personal.

---

## 🆘 Support

**Masalah atau pertanyaan?**
1. Cek [docs/INSTALLATION.md](./docs/INSTALLATION.md)
2. Buka browser DevTools dan cek console
3. Clear IndexedDB dan refresh
4. Pastikan Node.js versi 18+

---

## 🌟 Credits

Dibuat dengan ❤️ untuk UMKM Indonesia

**Tech Stack:**
- React Team
- Vite Team
- Dexie.js by David Fahlander
- Tailwind CSS
- Dan seluruh open-source contributors

---

**⭐ Star repo ini jika bermanfaat!**

**🚀 Siap deploy? `npm run dev` dan mulai jualan!**
