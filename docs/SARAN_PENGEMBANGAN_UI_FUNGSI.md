# Saran Pengembangan UI/UX & Fitur WarungWA

Dokumen ini berisi daftar pengembangan tahap berikutnya beserta prompt siap pakai untuk diproses AI assistant.

## 1) Prioritas UI/UX

### A. Sistem desain konsisten
- Buat token warna, spacing, radius, dan typografi di satu file tema.
- Standarkan komponen: button, input, table, card, modal, badge.
- Tambahkan mode gelap (dark mode) dengan preferensi tersimpan.

**Prompt**
> Refactor UI WarungWA menjadi design system yang konsisten. Buat token tema (color, spacing, radius, shadow), upgrade komponen reusable (Button, Input, Card, Badge, Table), dan tambahkan dark mode dengan penyimpanan preferensi di local storage.

### B. Navigasi & produktivitas
- Tambahkan command palette (Ctrl/Cmd + K) untuk akses cepat halaman/aksi.
- Tambahkan breadcrumbs dan shortcut tindakan utama.
- Tambahkan indikator keyboard shortcut di tooltip.

**Prompt**
> Implement command palette untuk WarungWA (Ctrl/Cmd + K) dengan fitur pencarian halaman dan aksi cepat (buat pesanan, tambah pelanggan, buka laporan). Tambahkan breadcrumbs pada header dan tampilkan shortcut di tooltip.

### C. Dashboard insight lanjutan
- Tambahkan KPI pertumbuhan mingguan/bulanan.
- Tambahkan kartu target harian dan progress bar.
- Tambahkan analisis penyebab order batal.

**Prompt**
> Tingkatkan dashboard WarungWA dengan KPI growth (WoW/MoM), progress target harian omzet dan jumlah order, serta breakdown alasan pembatalan pesanan dalam bentuk chart.

## 2) Prioritas Pengembangan Fitur

### A. CRM & retensi pelanggan
- Segmentasi pelanggan: baru, aktif, risiko churn, VIP.
- Otomasi reminder follow-up berdasarkan perilaku beli.
- Riwayat interaksi chat per pelanggan.

**Prompt**
> Tambahkan modul segmentasi pelanggan otomatis (new, active, churn risk, VIP), jadwal follow-up otomatis berbasis histori pembelian, dan timeline interaksi WhatsApp di halaman detail pelanggan.

### B. Operasional pesanan
- Multi-channel status (WhatsApp/manual/courier sync).
- SLA timer per status pesanan.
- Bulk action (update status, kirim template, export).

**Prompt**
> Sempurnakan modul pesanan dengan SLA timer tiap status, bulk action update status dan kirim template chat, serta indikator sumber order (WhatsApp/manual).

### C. Produk & inventori
- Notifikasi stok menipis.
- Paket bundling produk.
- Riwayat perubahan harga.

**Prompt**
> Implement manajemen inventori dengan threshold stok minimum, notifikasi restock, fitur bundling produk, dan audit trail perubahan harga produk.

## 3) Prioritas SEO & Akuisisi

### A. SEO teknis
- SSR/Prerender untuk halaman publik.
- Dynamic metadata per halaman.
- Tambahkan FAQ schema pada landing page.

**Prompt**
> Tingkatkan SEO WarungWA dengan prerender halaman publik, metadata dinamis per route, FAQ schema JSON-LD, robots.txt, sitemap.xml, canonical, dan optimasi Open Graph.

### B. SEO konten
- Buat blog edukasi UMKM dengan cluster topik.
- Internal linking otomatis antar artikel.
- CTA ke demo WarungWA.

**Prompt**
> Rancang struktur konten SEO untuk WarungWA: 20 ide artikel berbasis intent UMKM Indonesia, cluster topik, internal linking, dan CTA untuk trial/demo.

## 4) Prioritas Kualitas Produk

- Tambahkan unit test untuk logic store dan service.
- Tambahkan e2e smoke test untuk alur login → pesanan → laporan.
- Tambahkan error tracking dan analytics event.

**Prompt**
> Buat test plan WarungWA mencakup unit test (store/service), integration test DB lokal, e2e smoke test, dan instrumentation analytics + error tracking untuk fitur kritis.
