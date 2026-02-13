# WarungWA - Folder Structure

## 📁 Complete Project Structure

```
warungwa/
│
├── 📦 public/                    # Static assets
│   └── vite.svg
│
├── 📂 preview-screenshots/       # Preview images + descriptions
│   ├── dashboard.png
│   ├── kanban.png
│   ├── order-detail.png
│   └── descriptions.txt
│
├── 📂 live-preview/              # Live preview static assets
│   └── index.html
│
├── 📂 deliverables/              # Generated ZIP packages
│   ├── warungwa-buyer.zip
│   ├── warungwa-preview-screenshots.zip
│   ├── warungwa-live-preview.zip
│   └── README.md
│
├── 📂 scripts/                   # Utility scripts
│   └── package-deliverables.sh
│
├── 📂 src/
│   │
│   ├── 📂 lib/                   # Core libraries & utilities
│   │   ├── db.ts                # ✅ Dexie database schema + types
│   │   ├── store.ts             # ✅ Zustand state management
│   │   ├── whatsapp.ts          # ✅ WhatsApp helpers (wa.me link generator)
│   │   ├── pdf-invoice.tsx      # ✅ PDF invoice React component
│   │   └── export.ts            # ✅ Export/import helpers (JSON, CSV, Excel)
│   │
│   ├── 📂 components/            # Reusable UI components
│   │   ├── Layout.tsx           # ✅ Main layout with sidebar
│   │   ├── DataTable.tsx        # ✅ Generic data table with search/sort/pagination
│   │   ├── KanbanBoard.tsx      # ✅ Drag & drop kanban board (@dnd-kit)
│   │   ├── Modal.tsx            # ✅ Modal system
│   │   └── Toast.tsx            # ✅ Toast notification system
│   │
│   ├── 📂 pages/                 # Page components
│   │   ├── Login.tsx            # ✅ Login page (shop + role selector)
│   │   ├── Dashboard.tsx        # ✅ Dashboard with stats & charts
│   │   ├── Orders.tsx           # ✅ Orders page (kanban + list view)
│   │   ├── OrderDetail.tsx      # ✅ Order detail + WhatsApp integration
│   │   ├── Customers.tsx        # 🚧 Customer management (placeholder)
│   │   ├── Products.tsx         # 🚧 Product catalog (placeholder)
│   │   ├── Templates.tsx        # 🚧 Message templates (placeholder)
│   │   ├── Reports.tsx          # 🚧 Analytics & reports (placeholder)
│   │   └── Settings.tsx         # 🚧 App settings (placeholder)
│   │
│   ├── 📂 types/                 # TypeScript type definitions
│   │   └── index.ts             # (Optional: additional types)
│   │
│   ├── App.tsx                  # ✅ Main app component with routing
│   ├── main.tsx                 # ✅ React entry point
│   └── index.css                # ✅ Tailwind CSS + custom styles
│
├── 📂 docs/                      # Documentation
│   ├── INSTALLATION.md          # ✅ Installation & deployment guide
│   ├── FOLDER_STRUCTURE.md      # ✅ This file
│   ├── DELIVERABLES_ANALYSIS.md # ✅ Detailed packaging analysis
│   └── API_REFERENCE.md         # 📝 (Future: API documentation)
│
├── 📄 Configuration Files
│   ├── package.json             # Dependencies & scripts
│   ├── tsconfig.json            # TypeScript config
│   ├── tsconfig.app.json        # App-specific TS config
│   ├── tsconfig.node.json       # Node-specific TS config
│   ├── vite.config.ts           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js        # PostCSS config
│   ├── eslint.config.js         # ESLint config
│   └── .gitignore               # Git ignore rules
│
└── 📄 README.md                  # Main project documentation
```

---

## 📖 Detailed Component Descriptions

### `/src/lib/` - Core Libraries

#### `db.ts` (15KB)
- **Purpose:** Dexie.js database schema and TypeScript interfaces
- **Contains:**
  - 20+ TypeScript interfaces for all entities
  - Dexie database class with table definitions
  - Seed data function for demo content
  - Helper functions: `generateId()`, `now()`
- **Key Tables:**
  - `shops`, `products`, `customers`, `orders`, `orderItems`
  - `messageTemplates`, `shippingAreas`, `operatingHours`
  - `customerTags`, `reminders`, `activityLogs`, etc.

#### `store.ts` (3.5KB)
- **Purpose:** Zustand state management
- **Stores:**
  - `useAppStore`: Session, shop, role management
  - `useToastStore`: Toast notification queue
  - `useModalStore`: Modal open/close state

#### `whatsapp.ts` (5KB)
- **Purpose:** WhatsApp integration helpers
- **Functions:**
  - `generateWhatsAppLink()`: Create wa.me links
  - `replaceTemplateVariables()`: Fill template with order data
  - `openOrderWhatsApp()`: Open WhatsApp with pre-filled message
  - `isWithinOperatingHours()`: Check business hours
  - `formatCurrency()`: IDR currency formatter

#### `pdf-invoice.tsx` (8KB)
- **Purpose:** Generate invoice PDF using @react-pdf/renderer
- **Components:**
  - `InvoiceDocument`: Complete invoice layout
  - Header with shop branding
  - Order items table
  - Payment summary
  - Customer information

#### `export.ts` (14KB)
- **Purpose:** Data export/import functionality
- **Functions:**
  - `exportToJSON()`: Backup all data to JSON
  - `importFromJSON()`: Restore from JSON with merge option
  - `exportCustomersToExcel()`: Customer data to XLSX
  - `exportOrdersToExcel()`: Order data to XLSX
  - `exportCustomersToCSV()`: Customer data to CSV
  - `importProductsFromCSV()`: Import products from CSV

---

### `/src/components/` - UI Components

#### `Layout.tsx` (4.8KB)
- Sidebar navigation with collapse/expand
- Header with user info
- Shop switcher
- Role display
- Logout button

#### `DataTable.tsx` (6KB)
- Generic table component
- Search/filter functionality
- Column sorting
- Pagination
- Custom cell renderers

#### `KanbanBoard.tsx` (6.3KB)
- Drag & drop board using @dnd-kit
- 5 default columns (Baru → Selesai)
- Order cards with status badges
- Real-time status updates

#### `Modal.tsx` (1.7KB)
- Modal container with backdrop
- Size variants (sm, md, lg, xl)
- Close on backdrop click
- Body scroll lock

#### `Toast.tsx` (1.5KB)
- Toast notification system
- 4 types: success, error, warning, info
- Auto-dismiss with timer
- Slide-in animation

---

### `/src/pages/` - Page Components

#### `Login.tsx` (5.8KB)
- **Features:**
  - Shop selector dropdown
  - Role selector (Owner/Admin/Staff)
  - User name input
  - Demo mode info banner

#### `Dashboard.tsx` (12KB)
- **Features:**
  - 4 stat cards (orders, revenue, payments)
  - Reminder alerts
  - 7-day revenue chart (Recharts)
  - Top 5 products table
  - Recent orders table

#### `Orders.tsx` (9KB)
- **Features:**
  - Kanban/List view toggle
  - Status & payment filters
  - Drag & drop status change
  - Search by order number/customer
  - Create new order button

#### `OrderDetail.tsx` (16KB)
- **Features:**
  - Order items table with totals
  - Customer information
  - Status history timeline
  - Payment history
  - WhatsApp template selector
  - Send WhatsApp button
  - Download invoice PDF
  - Status badges

---

## 🗂️ Database Schema (IndexedDB)

### Core Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `shops` | Store/branch information | name, phone, address, logo |
| `appSession` | Current session state | currentShopId, currentRole, userName |
| `products` | Product catalog | name, price, category, isActive |
| `productVariants` | Product variations | name, priceAdjustment |
| `customers` | Customer database | name, phone, level, address |
| `customerTags` | Tag definitions | name, color |
| `customerTagJoin` | Customer-tag relations | customerId, tagId |
| `orders` | Order records | orderNumber, status, total |
| `orderItems` | Order line items | orderId, productId, quantity |
| `orderStatusHistory` | Status change log | orderId, status, changedBy |
| `payments` | Payment transactions | orderId, amount, method |
| `shippingAreas` | Delivery zones | name, cost, estimatedDays |
| `messageTemplates` | WhatsApp templates | name, language, template |
| `reminders` | Follow-up reminders | orderId, dueDate, isDone |
| `activityLogs` | Audit trail | action, description, performedBy |
| `operatingHours` | Business hours | dayOfWeek, openTime, closeTime |
| `quickCartTemplates` | Saved order templates | name, items[] |
| `customerLevelPricing` | Level-based pricing | level, discountPercent |

---

## 🔄 Data Flow

### Order Creation Flow
```
User → Orders Page → Create Order Form
  ↓
Validate (Zod)
  ↓
Save to IndexedDB (db.orders.add)
  ↓
Generate order items
  ↓
Create status history entry
  ↓
Update UI (Zustand store)
  ↓
Show toast notification
```

### WhatsApp Send Flow
```
Order Detail Page → Select Template
  ↓
Get customer & order data
  ↓
Replace template variables
  ↓
Generate wa.me link
  ↓
window.open(link) → WhatsApp Web/App
```

### Export Flow
```
Settings Page → Export Button
  ↓
Query IndexedDB for all data
  ↓
Transform to JSON/CSV/Excel
  ↓
Generate Blob
  ↓
Trigger download
```

---

## 📦 Build Output

After `npm run build`:

```
dist/
├── assets/
│   ├── index-[hash].js        # Main bundle
│   ├── index-[hash].css       # Styles
│   └── [vendor]-[hash].js     # Vendor chunks
├── index.html                 # Entry HTML
└── favicon.ico                # Icon
```

**Size Estimates:**
- Main bundle: ~150-200KB (gzipped)
- Vendor chunks: ~300-400KB (gzipped)
- Total: ~500-600KB (gzipped)

---

## 🚀 Deploy Structure (Vercel)

```
.vercel/
├── output/
│   ├── static/                # Built files from dist/
│   └── config.json            # Vercel config
└── project.json               # Project metadata
```

**Route Handling:**
- All routes serve `index.html` (SPA)
- Client-side routing via React Router
- No serverless functions needed

---

## 🔐 Security Considerations

| Aspect | Implementation |
|--------|----------------|
| Authentication | Local session in IndexedDB (demo mode) |
| Authorization | Role-based UI guards (OWNER/ADMIN/STAFF) |
| Data Storage | IndexedDB (browser-scoped, no network) |
| API Keys | None required (no backend) |
| WhatsApp | Public wa.me links only |

---

## 📝 Next Steps for Development

### Pages to Complete:
1. **Customers.tsx** - Customer CRUD with tags
2. **Products.tsx** - Product catalog with variants
3. **Templates.tsx** - Message template editor
4. **Reports.tsx** - Advanced analytics
5. **Settings.tsx** - Shop config, export/import

### Features to Add:
- [ ] CSV import for customers
- [ ] Bulk actions (delete, status change)
- [ ] Print labels
- [ ] Advanced search/filters
- [ ] Data sync between devices

---

**✅ Current Status:** MVP Complete (Dashboard, Orders, Order Detail with WhatsApp)

**🚧 In Progress:** Additional pages (Customers, Products, Settings)

**📋 Planned:** PWA support, advanced analytics, integrations
