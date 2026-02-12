# 📱 WarungWA

**Kelola katalog, pelanggan, dan pesanan — langsung closing lewat WhatsApp.**

Aplikasi web untuk UMKM (toko online kecil, reseller, F&B) yang membantu mengelola katalog produk, pelanggan, pipeline pesanan, dan template chat WhatsApp agar proses closing lebih cepat.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fitur Utama

### 🛍️ 1. Katalog Produk
- CRUD produk lengkap dengan kategori
- Varian/opsi produk (ukuran, warna, level pedas, dll)
- Status aktif/nonaktif
- Pencarian & filter kategori
- Import produk via CSV

### 👥 2. Manajemen Pelanggan (CRM Lite)
- CRUD data pelanggan
- Tag pelanggan (multi-tag)
- Level pelanggan: Retail / Reseller / Grosir
- Harga per level pelanggan
- Riwayat pesanan per pelanggan
- Deteksi duplikat nomor WhatsApp

### 📦 3. Pipeline Pesanan
- Status pipeline: Baru → Konfirmasi → Dikemas → Dikirim → Selesai
- **Kanban Board** dengan drag & drop
- List view dengan sorting & filter
- Label prioritas (Normal / Urgent)
- Activity log per pesanan
- Quick Cart untuk input cepat
- Template pesanan (paket produk)

### 💰 4. Manajemen Pembayaran
- Status pembayaran: Belum Bayar / DP / Lunas
- Metode pembayaran: Cash / Transfer / QRIS / COD
- Tracking pembayaran per order

### 🚚 5. Ongkir & Pengiriman
- Daftar area pengiriman
- Tarif ongkir per area
- Auto-hit ongkir saat buat order

### 💬 6. Template Chat WhatsApp
- Template pesan dengan variabel dinamis
- Variabel: {nama}, {total}, {order_id}, {alamat}, dll
- Multi-bahasa (ID / EN)
- Quick action "Kirim WA" → buka wa.me dengan pesan terisi otomatis
- Auto-reply berbasis jam operasional

### 📄 7. Invoice PDF
- Generate invoice dari data order
- Branding toko (logo, nama, alamat)
- Download PDF

### 📊 8. Laporan & Analytics
- Grafik omzet per hari/minggu
- Produk terlaris
- Customer paling sering order
- Export Excel/CSV

### 🏪 9. Multi-Toko / Cabang
- Buat beberapa toko (Cabang A, B, C)
- Data terpisah per toko
- Switch antar toko dengan mudah

### ⏰ 10. Reminder & Follow-up
- Set reminder per order
- Notifikasi browser (jika diizinkan)
- Reminder due hari ini tampil di dashboard

### 🔐 11. Multi-Admin + Role (Offline Mode)
- Role: Owner / Admin / Staff
- Pembatasan akses berbasis UI
- Activity log untuk audit

### 📥 12. Export & Import
- Export JSON (full backup)
- Export Excel/CSV (pelanggan, pesanan)
- Import JSON dengan merge otomatis
- Import CSV produk

## 🚀 Quick Start

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

Baca [docs/INSTALLATION.md](docs/INSTALLATION.md) untuk panduan lengkap.

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + Vite + TypeScript |
| **Styling** | Tailwind CSS |
| **Routing** | React Router v6 |
| **State Management** | Zustand |
| **Database** | Dexie.js (IndexedDB) |
| **Forms** | React Hook Form + Zod |
| **Drag & Drop** | dnd-kit |
| **PDF** | @react-pdf/renderer |
| **Charts** | Recharts |
| **Export** | xlsx + papaparse |

## 📂 Project Structure

```
warungwa/
├── src/
│   ├── lib/
│   │   ├── db/               # Database schema & seed
│   │   ├── stores/           # Zustand stores
│   │   ├── services/         # CRUD services
│   │   ├── utils/            # Utilities (WhatsApp, PDF, etc)
│   │   └── validators/       # Zod schemas
│   ├── components/
│   │   ├── ui/               # Reusable components (Button, Modal, Toast)
│   │   ├── layout/           # Layout components
│   │   ├── orders/           # Order Kanban board
│   │   ├── products/         # Product components
│   │   ├── customers/        # Customer components
│   │   └── templates/        # Message template components
│   ├── pages/                # Page components
│   │   ├── dashboard/        # Dashboard with analytics
│   │   ├── orders/           # Orders management
│   │   ├── products/         # Products catalog
│   │   ├── customers/        # Customer CRM
│   │   ├── templates/        # Message templates
│   │   ├── settings/         # App settings
│   │   ├── reports/          # Reports & analytics
│   │   └── login/            # Login (offline mode)
│   ├── types/                # TypeScript definitions
│   └── assets/               # Static assets
├── docs/                     # Documentation
└── public/                   # Public files
```

## 🎯 Use Cases

### 1. Toko Online Kecil
- Kelola katalog produk
- Terima order via form
- Kirim konfirmasi & invoice via WhatsApp

### 2. Reseller
- Track supplier dan customer
- Hitung margin per order
- Template pesan untuk follow-up

### 3. F&B / Warung Makan
- Menu dengan varian (level pedas, ukuran)
- Order delivery dengan area ongkir
- Reminder untuk order repeat

### 4. UMKM Multi-Cabang
- Data terpisah per cabang
- Report konsolidasi
- Standarisasi template chat

## ⚠️ Important Notes

1. **Frontend-Only**: Aplikasi ini 100% client-side, tanpa backend
2. **Data Storage**: Semua data tersimpan di IndexedDB browser
3. **WhatsApp**: Menggunakan Click-to-Chat (wa.me), BUKAN WhatsApp Business API resmi
4. **Backup**: Export data secara berkala untuk backup
5. **Multi-User**: Role switching hanya demo, tidak ada real authentication
6. **Offline Support**: App bisa jalan offline setelah pertama kali dimuat

## 🔒 Privacy & Security

- Semua data tersimpan **lokal di browser** Anda
- Tidak ada data yang dikirim ke server
- Tidak ada tracking atau analytics
- Data tidak dibagikan ke pihak ketiga

## 📖 Documentation

- [Installation Guide](docs/INSTALLATION.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [WhatsApp Integration](docs/WHATSAPP.md)

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- React & Vite teams
- Dexie.js for excellent IndexedDB wrapper
- Tailwind CSS for utility-first CSS
- All open-source contributors

## 💡 Roadmap

- [ ] PWA support (installable app)
- [ ] Offline sync indicator
- [ ] Print invoice
- [ ] QR code generator for products
- [ ] WhatsApp Web automation (optional)
- [ ] Backend integration (optional)

---

**Made with ❤️ for UMKM Indonesia**

*"Sederhana, Praktis, Siap Pakai"*
