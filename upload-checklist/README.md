# Files Upload Checklist - WarungWA

Struktur folder mengikuti checklist upload marketplace:

1. `thumbnail/thumbnail-80x80.png`
2. `inline-preview-image/preview-590x300.jpg`
3. `main-files/warungwa-main-files.zip`
4. `preview-screenshots/warungwa-preview-screenshots.zip`
5. `optional-live-preview/warungwa-live-preview.zip`
6. `optional-video-preview/` (manual upload)

## Catatan penting
Repo ini **tidak menyimpan file binary hasil upload** di Git. Semua artefak biner dibuat ulang dengan script generator.

## Generate semua artefak upload
Jalankan dari root project:

```bash
./upload-checklist/build-upload-files.sh
```

Script tersebut akan:
- menyalin thumbnail + inline preview image dari root project,
- membuat ZIP main files (source code + docs, tanpa aset preview/upload),
- membuat ZIP preview screenshots,
- membuat ZIP optional live preview.

## Dokumentasi per folder
Setiap folder checklist sudah memiliki `README.md` lokal untuk menjelaskan output, sumber data, dan cara pakai.
