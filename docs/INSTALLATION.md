# WarungWA - Installation Guide

## 📋 Requirements

- **Node.js**: v18.x or v20.x (recommended)
- **npm**: v9.x or higher
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet Connection**: Required for initial dependency installation

## 🚀 Quick Start

### 1. Clone or Download

```bash
git clone <repository-url>
cd warungwa
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- React 19
- Vite
- TypeScript
- Tailwind CSS
- Dexie.js (IndexedDB wrapper)
- React Router
- Zustand (State management)
- @react-pdf/renderer
- dnd-kit (Drag & drop)
- And more...

### 3. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173` (or another port if 5173 is busy).

### 4. Build for Production

```bash
npm run build
```

This creates an optimized static build in the `dist/` directory.

### 5. Preview Production Build

```bash
npm run preview
```

## 🌐 Deploy to Vercel

### Option 1: Via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
npm run build
vercel --prod
```

### Option 2: Via Vercel Dashboard

1. Push your code to GitHub, GitLab, or Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"

### Option 3: Via Vercel Git Integration

1. Connect your repository to Vercel
2. Vercel will automatically detect Vite configuration
3. Every push to main branch will trigger automatic deployment

## 📦 Deploy to Other Platforms

### Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy via Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Or drag and drop the `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)

### GitHub Pages

1. Update `vite.config.ts` to add base path:
```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... other config
})
```

2. Build and deploy:
```bash
npm run build
npx gh-pages -d dist
```

### Static File Hosting

Since this is a 100% client-side application, you can deploy to any static file hosting:
- AWS S3 + CloudFront
- Firebase Hosting
- Cloudflare Pages
- Surge.sh
- Any web server (Apache, Nginx, etc.)

Just upload the contents of the `dist/` folder after running `npm run build`.

## 🗄️ Data Storage

WarungWA stores all data locally in the browser using **IndexedDB**:

- **Database Name**: `WarungWADB`
- **Storage Location**: Browser's IndexedDB storage
- **Persistence**: Data persists until manually cleared
- **Size Limit**: Typically 50MB+ (browser dependent)

### First Run

On first run, the app automatically seeds demo data including:
- 1 Demo shop
- 3 Product categories
- 3 Sample products with variants
- 2 Sample customers
- 1 Sample order
- Default message templates
- Operating hours configuration

### Backup & Restore

Use the **Export/Import** feature in Settings to:
- Export all data as JSON backup
- Import data from previous backup
- Merge data to avoid duplicates

## 🔧 Configuration

### Environment Variables (Optional)

Create `.env` file in the root directory:

```env
# Optional: Custom settings can be added here
VITE_APP_NAME=WarungWA
VITE_APP_VERSION=1.0.0
```

### Customize Shop Info

After first login:
1. Go to **Pengaturan** (Settings)
2. Update shop name, address, phone, logo
3. Configure operating hours
4. Set up shipping areas
5. Customize message templates

## 🐛 Troubleshooting

### Port Already in Use

If port 5173 is busy:
```bash
npm run dev -- --port 3000
```

### Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Browser Compatibility Issues

Make sure you're using a modern browser:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### IndexedDB Not Available

If running in private/incognito mode, some browsers restrict IndexedDB. Use normal browsing mode.

### Clear All Data

To reset the app:
1. Open browser DevTools (F12)
2. Go to Application > IndexedDB
3. Delete `WarungWADB`
4. Refresh the page

## 📱 PWA (Progressive Web App) - Optional

To enable offline support, add service worker configuration:

1. Install PWA plugin:
```bash
npm install -D vite-plugin-pwa
```

2. Update `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'WarungWA',
        short_name: 'WarungWA',
        description: 'Kelola katalog, pelanggan, dan pesanan',
        theme_color: '#2563eb',
      }
    })
  ]
})
```

## 🔒 Security Notes

- All data stored locally in browser
- No backend/server required
- No data transmitted over network
- WhatsApp integration uses wa.me public links only
- No WhatsApp API credentials required

## 📄 License

This is a demo/template project. Modify as needed for your use case.

## 🆘 Support

For issues or questions:
1. Check browser console for errors
2. Verify Node.js version
3. Clear browser cache and IndexedDB
4. Rebuild from clean install

---

**Ready to start?** Run `npm run dev` and go to `http://localhost:5173`! 🚀
