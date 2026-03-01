import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';

interface LayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  description: string;
}

const menuItems: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', description: 'Ringkasan performa toko' },
  { path: '/pesanan', label: 'Pesanan', icon: '📦', description: 'Kelola order masuk' },
  { path: '/pelanggan', label: 'Pelanggan', icon: '👥', description: 'Data customer dan histori' },
  { path: '/produk', label: 'Produk', icon: '🛍️', description: 'Produk, kategori, harga' },
  { path: '/template-chat', label: 'Template Chat', icon: '💬', description: 'Template pesan WhatsApp' },
  { path: '/laporan', label: 'Laporan', icon: '📈', description: 'Analitik penjualan' },
  { path: '/pengaturan', label: 'Pengaturan', icon: '⚙️', description: 'Konfigurasi toko dan aplikasi' },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentShop, session, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  const isActive = (path: string) => location.pathname.startsWith(path);

  const filteredMenuItems = useMemo(() => {
    if (!menuSearch.trim()) return menuItems;
    const keyword = menuSearch.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.label.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
    );
  }, [menuSearch]);

  const currentPage = menuItems.find((item) => isActive(item.path));

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50 text-slate-800">
      <aside
        className={`relative border-r border-slate-200/80 bg-white/95 backdrop-blur transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-72' : 'w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-bold text-lg text-emerald-600 leading-tight">WarungWA</p>
                  <p className="text-[11px] text-slate-500">Commerce lewat WhatsApp</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-500 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition"
                aria-label="Tutup sidebar"
              >
                ◀
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-700 mx-auto p-1 rounded hover:bg-slate-100 transition"
              aria-label="Buka sidebar"
            >
              ▶
            </button>
          )}
        </div>

        {sidebarOpen && currentShop && (
          <div className="p-4 border-b border-slate-200/80 bg-gradient-to-r from-emerald-50 to-blue-50 flex-shrink-0">
            <p className="text-xs uppercase tracking-wide text-slate-500">Toko Aktif</p>
            <p className="font-semibold text-slate-900 truncate">{currentShop.name}</p>
            <p className="text-xs text-slate-500 mt-1">
              Role: <span className="font-medium">{session?.currentRole}</span>
            </p>
          </div>
        )}

        {sidebarOpen && (
          <div className="px-4 pt-4">
            <input
              type="search"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        )}

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={sidebarOpen ? '' : item.label}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-xl transition ${
                isActive(item.path)
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <div className="min-w-0">
                  <span className="font-medium block leading-tight">{item.label}</span>
                  <span className={`text-xs ${isActive(item.path) ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {item.description}
                  </span>
                </div>
              )}
            </Link>
          ))}

          {filteredMenuItems.length === 0 && sidebarOpen && (
            <p className="text-sm text-slate-500 px-2 py-4 text-center">Menu tidak ditemukan.</p>
          )}
        </nav>

        <div className="p-4 border-t border-slate-200/80 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition"
            title="Keluar"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {sidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white/90 backdrop-blur border-b border-slate-200/80 flex items-center justify-between px-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {currentPage?.label || 'WarungWA'}
            </h2>
            <p className="text-xs text-slate-500">
              Optimasi operasional toko dalam satu dashboard
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/pesanan"
              className="hidden md:inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              + Pesanan
            </Link>
            <Link
              to="/pelanggan"
              className="hidden md:inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              + Pelanggan
            </Link>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{session?.userName || 'User'}</p>
              <p className="text-xs text-slate-500">{session?.currentRole}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
              {session?.userName?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
