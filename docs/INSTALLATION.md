# WarungWA - Installation Guide

## 📋 Requirements

- **Node.js**: Version 18.x atau 20.x
- **npm**: Version 9.x atau lebih tinggi
- **Browser Modern**: Chrome, Firefox, Safari, atau Edge (untuk IndexedDB support)

## 🚀 Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url>
cd warungwa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 4. Build untuk Production

```bash
npm run build
```

File static akan di-generate di folder `dist/`

### 5. Preview Production Build

```bash
npm run preview
```

## 🌐 Deploy ke Vercel

### Option 1: Via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Deploy ke production
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. Push code ke GitHub/GitLab/Bitbucket
2. Import project di [vercel.com](https://vercel.com)
3. Vercel akan auto-detect Vite configuration
4. Click "Deploy"

### Vercel Configuration

Buat file `vercel.json` di root project (opsional):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

## 🗄️ Data Storage

Aplikasi ini menggunakan **IndexedDB** untuk menyimpan data di browser. Data akan tetap ada meskipun browser ditutup, kecuali:

- Cache browser dibersihkan
- User menghapus data aplikasi

### Backup & Restore

Gunakan fitur Export/Import di halaman **Pengaturan** untuk:
- Export semua data ke file JSON
- Import data dari backup JSON
- Merge data tanpa duplikasi

## 🔧 Environment Variables

Aplikasi ini **tidak memerlukan** environment variables karena berjalan 100% di client-side.

## 📦 Project Structure

```
warungwa/
├── src/
│   ├── lib/
│   │   ├── db/           # Dexie database schema & seed
│   │   ├── stores/       # Zustand state management
│   │   ├── services/     # CRUD services
│   │   ├── utils/        # Utility functions (WhatsApp, PDF, etc)
│   │   └── validators/   # Zod schemas
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── layout/       # Layout components
│   │   └── orders/       # Order-specific components (Kanban)
│   ├── pages/            # Page components
│   ├── types/            # TypeScript type definitions
│   └── assets/           # Static assets
├── docs/                 # Documentation
├── public/               # Public static files
└── package.json
```

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Dexie.js** - IndexedDB wrapper
- **Zustand** - State management
- **React Router** - Routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **dnd-kit** - Drag & drop (Kanban)
- **@react-pdf/renderer** - PDF generation
- **Recharts** - Charts & analytics
- **xlsx** - Excel export
- **papaparse** - CSV parsing

## 🐛 Troubleshooting

### IndexedDB tidak bekerja

Pastikan browser Anda support IndexedDB:
- Buka DevTools → Application → Storage → IndexedDB
- Jika ada error, coba clear browser cache

### Build gagal

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Data hilang

- Pastikan tidak menggunakan Incognito/Private mode
- Jangan clear browser data
- Gunakan fitur Export untuk backup rutin

## 📝 Notes

1. **Offline First**: Aplikasi bisa berjalan offline setelah pertama kali dimuat
2. **No Backend Required**: Semua data tersimpan di browser
3. **WhatsApp Integration**: Menggunakan Click-to-Chat (wa.me), bukan WhatsApp Business API resmi
4. **Multi-user**: Role switching hanya untuk demo, tidak ada real authentication

## 🆘 Support

Jika ada masalah, check:
1. Node version: `node --version` (harus 18.x atau 20.x)
2. Browser console untuk error messages
3. IndexedDB di DevTools

---

**Happy Coding! 🚀**
