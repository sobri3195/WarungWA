# Analisis Detail & Mendalam Deliverables WarungWA

Dokumen ini merinci kebutuhan paket ZIP untuk distribusi template serta bagaimana struktur file dipetakan ke setiap paket.

## 1. ZIP Utama (All files for buyers, tanpa preview images)

### Tujuan
Paket ini disiapkan sebagai source utama yang akan digunakan pembeli untuk pengembangan, modifikasi, atau deployment.

### Strategi Penyusunan
- **Termasuk:** seluruh source code aplikasi, dokumentasi, konfigurasi build, dan dependensi deklaratif.
- **Dikecualikan:** asset preview (screenshot), file build hasil generate, serta folder yang tidak relevan bagi pembeli.

### Struktur Isi (High-Level)
- `src/` → Seluruh kode React + TypeScript + Tailwind.
- `public/` → Asset statis.
- `docs/` → Dokumentasi penggunaan.
- `package.json` dan `package-lock.json` → Deklarasi dependensi.
- `vite.config.ts`, `tailwind.config.js`, `tsconfig*.json` → Konfigurasi tooling.

### Output
`deliverables/warungwa-buyer.zip`

## 2. ZIP Preview Screenshots

### Tujuan
Menyediakan set gambar untuk kebutuhan preview di halaman listing marketplace.

### Konten
- `preview-screenshots/dashboard.png`
- `preview-screenshots/kanban.png`
- `preview-screenshots/order-detail.png`
- `preview-screenshots/descriptions.txt` → Deskripsi singkat untuk tiap gambar.

### Output
`deliverables/warungwa-preview-screenshots.zip`

## 3. ZIP Live Preview (Optional)

### Tujuan
Memberikan versi ringkas yang bisa ditampilkan sebagai live preview statis tanpa build tool.

### Konten
- `live-preview/index.html` → HTML statis dengan highlight fitur utama.

### Output
`deliverables/warungwa-live-preview.zip`

## 4. Mekanisme Packaging

Skrip `scripts/package-deliverables.sh` digunakan agar proses packaging konsisten dan dapat diulang. Skrip ini:
1. Membuat folder `deliverables/`.
2. Membuat ZIP utama dengan pengecualian folder preview dan build.
3. Membuat ZIP khusus screenshot.
4. Membuat ZIP khusus live preview.

### Cara Menjalankan
```bash
./scripts/package-deliverables.sh
```

## 5. Catatan Tambahan

- Screenshot dihasilkan sebagai placeholder berwarna solid agar konsisten ukuran file dan mudah diganti dengan screenshot asli aplikasi.
- Jika tersedia screenshot real, cukup replace file PNG di `preview-screenshots/` dan jalankan ulang skrip.
