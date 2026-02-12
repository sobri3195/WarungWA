# 📁 WarungWA - Folder Structure

## Complete Project Tree

```
warungwa/
│
├── public/                          # Static files yang tidak diproses Vite
│   └── (empty - bisa untuk logo, favicon, dll)
│
├── src/                             # Source code utama
│   │
│   ├── lib/                         # Business logic & utilities
│   │   │
│   │   ├── db/                      # Database layer
│   │   │   ├── schema.ts            # Dexie schema & table definitions
│   │   │   └── seed.ts              # Initial seed data
│   │   │
│   │   ├── stores/                  # Zustand state management
│   │   │   ├── sessionStore.ts      # App session & auth state
│   │   │   └── toastStore.ts        # Toast notification state
│   │   │
│   │   ├── services/                # CRUD services (business logic)
│   │   │   ├── orderService.ts      # Order CRUD operations
│   │   │   ├── productService.ts    # Product CRUD (to be created)
│   │   │   ├── customerService.ts   # Customer CRUD (to be created)
│   │   │   └── templateService.ts   # Message template CRUD (to be created)
│   │   │
│   │   ├── utils/                   # Helper functions
│   │   │   ├── whatsapp.ts          # WhatsApp link generator & utils
│   │   │   ├── invoice.tsx          # PDF invoice generator
│   │   │   ├── export.ts            # Export CSV/Excel (to be created)
│   │   │   └── date.ts              # Date formatting (to be created)
│   │   │
│   │   └── validators/              # Zod schemas for validation
│   │       ├── order.ts             # Order validation schemas (to be created)
│   │       ├── product.ts           # Product validation schemas (to be created)
│   │       └── customer.ts          # Customer validation schemas (to be created)
│   │
│   ├── components/                  # React components
│   │   │
│   │   ├── ui/                      # Reusable UI components
│   │   │   ├── Button.tsx           # Button component
│   │   │   ├── Modal.tsx            # Modal/Dialog component
│   │   │   ├── Toast.tsx            # Toast notification component
│   │   │   ├── Input.tsx            # Form input (to be created)
│   │   │   ├── Select.tsx           # Select dropdown (to be created)
│   │   │   ├── Table.tsx            # Data table (to be created)
│   │   │   └── Card.tsx             # Card container (to be created)
│   │   │
│   │   ├── layout/                  # Layout components
│   │   │   ├── DashboardLayout.tsx  # Main dashboard layout with sidebar
│   │   │   └── AuthLayout.tsx       # Auth layout (to be created)
│   │   │
│   │   ├── orders/                  # Order-specific components
│   │   │   ├── OrderKanban.tsx      # Kanban board with drag & drop
│   │   │   ├── OrderForm.tsx        # Order create/edit form (to be created)
│   │   │   ├── OrderDetail.tsx      # Order detail view (to be created)
│   │   │   └── QuickCart.tsx        # Quick order cart (to be created)
│   │   │
│   │   ├── products/                # Product-specific components
│   │   │   ├── ProductForm.tsx      # Product form (to be created)
│   │   │   ├── ProductCard.tsx      # Product card (to be created)
│   │   │   └── VariantManager.tsx   # Variant manager (to be created)
│   │   │
│   │   ├── customers/               # Customer-specific components
│   │   │   ├── CustomerForm.tsx     # Customer form (to be created)
│   │   │   ├── CustomerCard.tsx     # Customer card (to be created)
│   │   │   └── TagManager.tsx       # Tag manager (to be created)
│   │   │
│   │   └── templates/               # Template-specific components
│   │       ├── TemplateForm.tsx     # Template form (to be created)
│   │       ├── TemplatePreview.tsx  # Template preview (to be created)
│   │       └── VariableSelector.tsx # Variable selector (to be created)
│   │
│   ├── pages/                       # Page components (route handlers)
│   │   │
│   │   ├── login/                   # Login page
│   │   │   └── LoginPage.tsx        # Login/role selection
│   │   │
│   │   ├── dashboard/               # Dashboard page
│   │   │   └── Dashboard.tsx        # Main dashboard with stats & charts
│   │   │
│   │   ├── orders/                  # Orders pages
│   │   │   ├── OrdersPage.tsx       # Orders list/kanban
│   │   │   ├── OrderDetailPage.tsx  # Order detail (to be created)
│   │   │   └── CreateOrderPage.tsx  # Create order (to be created)
│   │   │
│   │   ├── products/                # Products pages
│   │   │   ├── ProductsPage.tsx     # Products list (to be created)
│   │   │   └── ProductDetailPage.tsx # Product detail (to be created)
│   │   │
│   │   ├── customers/               # Customers pages
│   │   │   ├── CustomersPage.tsx    # Customers list (to be created)
│   │   │   └── CustomerDetailPage.tsx # Customer detail (to be created)
│   │   │
│   │   ├── templates/               # Templates pages
│   │   │   └── TemplatesPage.tsx    # Message templates (to be created)
│   │   │
│   │   ├── reports/                 # Reports pages
│   │   │   └── ReportsPage.tsx      # Analytics & reports (to be created)
│   │   │
│   │   └── settings/                # Settings pages
│   │       └── SettingsPage.tsx     # App settings (to be created)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useOrders.ts             # Orders hook (to be created)
│   │   ├── useProducts.ts           # Products hook (to be created)
│   │   └── useDebounce.ts           # Debounce hook (to be created)
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                 # All type definitions & interfaces
│   │
│   ├── assets/                      # Static assets (images, fonts, etc)
│   │   └── (empty - untuk logo, images, dll)
│   │
│   ├── App.tsx                      # Root App component with routing
│   ├── main.tsx                     # App entry point
│   └── index.css                    # Global CSS with Tailwind
│
├── docs/                            # Documentation
│   ├── INSTALLATION.md              # Installation guide
│   ├── FOLDER_STRUCTURE.md          # This file
│   ├── API.md                       # API reference (to be created)
│   ├── DATABASE.md                  # Database schema (to be created)
│   └── WHATSAPP.md                  # WhatsApp integration (to be created)
│
├── node_modules/                    # Dependencies (gitignored)
│
├── .gitignore                       # Git ignore rules
├── index.html                       # HTML entry point
├── package.json                     # Dependencies & scripts
├── package-lock.json                # Lock file
├── postcss.config.js                # PostCSS config for Tailwind
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript config
├── tsconfig.node.json               # TypeScript config for Node
├── vite.config.ts                   # Vite configuration
├── README.md                        # Project readme
└── LICENSE                          # License file
```

## 📂 Key Directories Explained

### `/src/lib`
Core business logic yang independent dari UI. Berisi:
- **db**: Schema database & seed data
- **stores**: Global state management dengan Zustand
- **services**: CRUD operations & business logic
- **utils**: Helper functions (WhatsApp, PDF, export, dll)
- **validators**: Zod schemas untuk validasi input

### `/src/components`
React components yang reusable:
- **ui**: Generic UI components (Button, Modal, Table, dll)
- **layout**: Layout components untuk halaman
- **orders**: Components khusus untuk orders
- **products**: Components khusus untuk products
- **customers**: Components khusus untuk customers
- **templates**: Components khusus untuk message templates

### `/src/pages`
Page components yang menjadi route handlers. Setiap folder biasanya punya:
- List page (index/all items)
- Detail page (single item)
- Create/Edit page

### `/src/types`
Semua TypeScript type definitions & interfaces dalam satu file `index.ts`.

### `/docs`
Dokumentasi lengkap untuk development & deployment.

## 🏗️ Architecture Pattern

Aplikasi menggunakan **Layered Architecture**:

```
┌─────────────────────────────────────┐
│          PAGES (Routes)             │  ← Route handlers
├─────────────────────────────────────┤
│         COMPONENTS (UI)             │  ← Presentational components
├─────────────────────────────────────┤
│       STORES (State Mgmt)           │  ← Global state (Zustand)
├─────────────────────────────────────┤
│      SERVICES (Business Logic)      │  ← CRUD operations
├─────────────────────────────────────┤
│        DATABASE (Dexie/IDB)         │  ← Data persistence
└─────────────────────────────────────┘
```

## 🔄 Data Flow

1. **User Action** → Component
2. Component → Service (CRUD)
3. Service → Database (Dexie)
4. Database → Service (return data)
5. Service → Store (update state)
6. Store → Component (re-render)

## 📝 Naming Conventions

- **Files**: PascalCase untuk components (`OrderKanban.tsx`)
- **Files**: camelCase untuk utilities (`whatsapp.ts`)
- **Components**: PascalCase (`<OrderKanban />`)
- **Functions**: camelCase (`getOrders()`)
- **Constants**: UPPER_SNAKE_CASE (`ORDER_STATUS`)
- **Types**: PascalCase (`Order`, `OrderItem`)

## 🎯 Best Practices

1. **Keep components small**: Max 200-300 lines
2. **Extract logic to services**: Don't put business logic in components
3. **Use TypeScript**: Type everything properly
4. **Reuse UI components**: Don't create duplicate buttons/inputs
5. **Follow folder structure**: Keep related files together

---

**Need to add new features?** Follow this structure to keep code organized!
