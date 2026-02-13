# Files Upload Checklist - WarungWA

Struktur folder mengikuti checklist upload marketplace:

1. `thumbnail/thumbnail-80x80.png`
2. `inline-preview-image/preview-590x300.jpg`
3. `main-files/warungwa-main-files.zip`
4. `preview-screenshots/warungwa-preview-screenshots.zip`
5. `optional-live-preview/warungwa-live-preview.zip`
6. `optional-video-preview/README.md`

## Catatan penting
Repo ini **tidak menyimpan file binary** di dalam folder checklist. Untuk menghasilkan semua file upload yang dibutuhkan, jalankan:

```bash
./upload-checklist/build-upload-files.sh
```

Script tersebut akan:
- menyalin thumbnail + inline preview image dari root project,
- membuat ZIP main files (source code + docs, tanpa preview images),
- membuat ZIP preview screenshots,
- membuat ZIP optional live preview.
