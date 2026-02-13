# Asset Manifest (Non-binary patch friendly)

Dokumen ini menggantikan duplikasi file biner di `design-assets/`.

## Required Outputs

| Requirement | File yang digunakan | Ukuran |
|---|---|---|
| JPEG or PNG 80x80px Thumbnail | `thumbnail-80x80.png` | 80x80 |
| Inline Preview Image | `preview-590x300.png` | 590x300 |
| Main File(s) 590x300 JPEG | `preview-590x300.jpg` | 590x300 |

## Kenapa tidak disalin ulang?

Review sebelumnya memberi batasan **"Binary files are not supported"**. Karena itu, patch ini:
- tidak menambah file biner baru,
- menggunakan aset yang sudah ada di repository,
- menambahkan validasi otomatis melalui script teks.

## Validasi cepat

```bash
node scripts/validate-image-dimensions.mjs
```

