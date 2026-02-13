# Analisis Detail & Mendalam: Spesifikasi Gambar WarungWA

## 1) Interpretasi Requirement
Dari brief:
- **JPEG or PNG 80x80px Thumbnail**
- **Inline Preview Image**
- **590x300 JPEG Main File(s)**

Maka ada 3 deliverable wajib dengan fokus pada **konsistensi dimensi**, **keterbacaan UI**, dan **kompatibilitas upload**.

## 2) Deliverable Final (Menggunakan Aset Existing)
Untuk menghindari masalah review `Binary files are not supported`, patch ini **tidak menambah binary baru** dan memakai aset yang sudah ada:

1. Thumbnail: `thumbnail-80x80.png` (80x80)
2. Inline Preview: `preview-590x300.png` (590x300)
3. Main File: `preview-590x300.jpg` (590x300)

Referensi ringkas ada di `design-assets/ASSET_MANIFEST.md`.

## 3) Analisis Kualitas per Format

### A. Thumbnail 80x80 (PNG)
- Cocok untuk elemen UI kecil (daftar/card/avatar).
- PNG dipilih karena detail ikon/teks kecil lebih tajam daripada JPEG.
- Risiko utama: detail berlebih tidak terbaca pada ukuran mini.

### B. Inline Preview 590x300 (PNG)
- Rasio horizontal cocok untuk section preview.
- PNG menjaga ketajaman garis UI dan teks.
- Cocok untuk tampilan embedded di dashboard/admin panel.

### C. Main File 590x300 (JPEG)
- Dibutuhkan saat platform/marketplace meminta format JPEG.
- Kompresi JPEG lebih hemat ukuran file untuk distribusi.
- Trade-off: artefak kompresi bisa muncul di area teks kecil.

## 4) Prompt Siap Pakai (untuk Regenerasi)
Jika Anda ingin regenerate gambar via tool desain/AI image generator, gunakan prompt berikut:

```text
Buat paket gambar UI bertema dashboard aplikasi "WarungWA" dengan gaya modern, bersih, warna biru dominan.
Output wajib:
1) Thumbnail ukuran 80x80 px (PNG), fokus pada elemen sidebar + judul WarungWA.
2) Inline preview ukuran 590x300 px (PNG), menampilkan komposisi 3 panel: Dashboard, Pesanan, Pelanggan.
3) Main file ukuran 590x300 px (JPEG), komposisi sama dengan inline preview namun dioptimasi kompresi JPEG.
Pastikan teks tetap terbaca, kontras tinggi, dan tidak blur.
```

## 5) Validasi Teknis
Validasi ukuran dilakukan via script non-binary:

```bash
node scripts/validate-image-dimensions.mjs
```

Script memastikan setiap file tepat di resolusi target.

## 6) Rekomendasi Implementasi Produk
- Gunakan thumbnail untuk list/grid kecil.
- Gunakan PNG preview untuk tampilan in-app.
- Gunakan JPEG main untuk upload eksternal saat diminta format JPEG.
