# Paket ZIP WarungWA

Dokumen ini menjelaskan isi paket ZIP yang disiapkan untuk kebutuhan marketplace/delivery aset.

## Ringkasan Paket

| Paket | Keterangan | Isi Utama |
| --- | --- | --- |
| `warungwa-buyer.zip` | Paket utama untuk pembeli | Source code aplikasi tanpa preview screenshot | 
| `warungwa-preview-screenshots.zip` | Preview screenshot | Gambar PNG + deskripsi singkat | 
| `warungwa-live-preview.zip` | Live preview statis | `index.html` dengan ringkasan fitur | 

## Cara Regenerasi

Gunakan skrip berikut jika ingin membuat ulang paket ZIP:

```bash
./scripts/package-deliverables.sh
```

Skrip akan menaruh output di folder `deliverables/`.
