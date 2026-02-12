# Modul Pelanggan - WarungWA

## Gambaran Umum

Modul Pelanggan adalah sistem manajemen pelanggan lengkap yang memungkinkan pengelola toko untuk:
- Mengelola data pelanggan (tambah, edit, hapus, lihat detail)
- Mengkategorikan pelanggan berdasarkan level (Retail, Reseller, Grosir)
- Menandai pelanggan dengan tag
- Melihat riwayat pesanan dan aktivitas pelanggan
- Mengekspor data pelanggan ke CSV
- Menghubungi pelanggan via WhatsApp

## Fitur Utama

### 1. Daftar Pelanggan (`/pelanggan`)

**Halaman:** `src/pages/Customers.tsx`

Fitur:
- Tabel data pelanggan dengan informasi lengkap
- Statistik ringkasan: Total pelanggan, Retail, Reseller, Grosir
- Filter berdasarkan level pelanggan
- Filter berdasarkan tag
- Pencarian berdasarkan nama, nomor HP, dan email
- Aksi: Tambah, Edit, Hapus pelanggan
- Export data ke CSV
- Sortir kolom tabel
- Click baris untuk melihat detail

Kolom Tabel:
- Nama & Nomor HP
- Email
- Level (badge berwarna)
- Tag (dengan warna custom)
- Jumlah Pesanan
- Total Belanja
- Aksi (Edit/Hapus)

### 2. Detail Pelanggan (`/pelanggan/:id`)

**Halaman:** `src/pages/CustomerDetail.tsx`

Fitur:
- Informasi lengkap pelanggan:
  - Data pribadi (nama, HP, email, alamat)
  - Level pelanggan
  - Tag
  - Catatan
  - Tanggal bergabung
- Statistik pelanggan:
  - Total pesanan
  - Total belanja
  - Rata-rata nilai pesanan
  - Pesanan selesai
- Tab Riwayat Pesanan:
  - Tabel pesanan dengan status dan pembayaran
  - Click untuk lihat detail pesanan
- Tab Aktivitas:
  - Log aktivitas terkait pelanggan
  - Timestamp dan user yang melakukan aksi
- Aksi:
  - Tombol WhatsApp (langsung buka wa.me)
  - Edit pelanggan
  - Hapus pelanggan
  - Kembali ke daftar

### 3. Form Pelanggan (Modal)

**Komponen:** `src/components/customers/CustomerFormModal.tsx`

Fitur:
- Form untuk tambah/edit pelanggan
- Field:
  - Nama (required)
  - Nomor HP (required, validasi format)
  - Email (optional, validasi format)
  - Alamat (optional)
  - Level (required: Retail/Reseller/Grosir)
  - Tag (multiple selection)
  - Catatan (optional)
- Validasi:
  - Nama wajib diisi
  - Nomor HP wajib diisi dan format valid (08xxx atau 628xxx)
  - Email format valid
  - Nomor HP unik per toko
- Normalisasi nomor HP ke format 62xxx
- Auto-close modal setelah berhasil

## Struktur Data

### Customer
```typescript
interface Customer {
  id: string;
  shopId: string;
  name: string;
  phone: string; // Format: 62xxx
  email?: string;
  address?: string;
  level: 'RETAIL' | 'RESELLER' | 'GROSIR';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

### CustomerTag
```typescript
interface CustomerTag {
  id: string;
  shopId: string;
  name: string;
  color: string; // Hex color
  createdAt: string;
  updatedAt: string;
}
```

### CustomerTagJoin
```typescript
interface CustomerTagJoin {
  id: string;
  customerId: string;
  tagId: string;
  createdAt: string;
}
```

## Integrasi

### Database (Dexie)
- Menggunakan IndexedDB melalui Dexie
- Query dengan index untuk performa optimal
- Relasi dengan tabel lain: orders, customerTags, customerTagJoin

### State Management (Zustand)
- `useAppStore`: session, currentShop
- `useToastStore`: notifikasi sukses/error
- `useModalStore`: menampilkan modal form

### Routing (React Router)
- `/pelanggan` - List pelanggan
- `/pelanggan/:id` - Detail pelanggan

### Komponen Reusable
- `DataTable` - Tabel dengan fitur sorting, searching, pagination
- `Modal` - Modal container
- `Toast` - Notifikasi

## Fitur WhatsApp

Integrasi dengan WhatsApp:
- Generate link wa.me dengan nomor pelanggan
- Pre-filled message
- Buka di tab baru
- Format nomor otomatis ke 62xxx

Fungsi helper: `generateWhatsAppLink(phone, message)`

## Export CSV

Fitur export data pelanggan:
- Format CSV dengan encoding UTF-8
- Kolom: Nama, No. HP, Email, Alamat, Level, Tag, Total Pesanan, Total Belanja, Catatan, Tanggal Dibuat
- Filename: `pelanggan-{timestamp}.csv`

Fungsi helper: `exportToCSV(data, filename)`

## Activity Logging

Setiap aksi dicatat di activity log:
- Pelanggan ditambahkan
- Pelanggan diupdate
- Pelanggan dihapus

Log mencakup:
- Entity type: CUSTOMER
- Entity ID: customer.id
- Action: CREATED / UPDATED / DELETED
- Description: deskripsi yang readable
- Performed by: username
- Timestamp

## Validasi & Error Handling

### Validasi Form
- Required fields
- Format nomor HP
- Format email
- Nomor HP unik

### Error Handling
- Try-catch pada semua operasi database
- Toast notification untuk error
- Confirmation dialog untuk delete
- Cek relasi sebelum delete (tidak bisa hapus jika masih ada pesanan)

## Styling

Menggunakan Tailwind CSS:
- Responsive design (mobile-first)
- Color scheme konsisten:
  - Blue: Retail, Primary actions
  - Purple: Reseller
  - Orange: Grosir
  - Red: Delete, Error
  - Green: Success, WhatsApp
- Badge & Tag dengan warna custom
- Loading states
- Empty states dengan icon

## Best Practices

1. **Performance**
   - Load data on mount dengan useEffect
   - Index database queries
   - Lazy load detail page
   - Memoize expensive calculations

2. **UX**
   - Loading indicators
   - Empty states dengan pesan jelas
   - Confirmation dialogs untuk destructive actions
   - Toast notifications untuk feedback
   - Breadcrumb/back button untuk navigasi

3. **Code Quality**
   - TypeScript untuk type safety
   - Reusable components
   - Consistent naming conventions
   - Error boundaries
   - ESLint compliance

## Testing Considerations

Area untuk testing:
1. CRUD operations
2. Form validation
3. Phone number normalization
4. WhatsApp link generation
5. CSV export
6. Filter & search
7. Delete dengan relasi order

## Future Enhancements

Ide pengembangan:
1. Bulk import dari CSV
2. Segmentasi pelanggan otomatis
3. Customer lifetime value calculation
4. RFM (Recency, Frequency, Monetary) analysis
5. Bulk actions (delete, assign tags)
6. Customer groups/segments
7. Email marketing integration
8. Loyalty program
9. Customer notes/timeline
10. Advanced filtering (date range, order count, etc)
