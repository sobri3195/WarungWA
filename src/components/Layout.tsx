import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentShop, session, logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/pesanan', label: 'Pesanan', icon: '📦' },
    { path: '/pelanggan', label: 'Pelanggan', icon: '👥' },
    { path: '/produk', label: 'Produk', icon: '🛍️' },
    { path: '/template-chat', label: 'Template Chat', icon: '💬' },
    { path: '/laporan', label: 'Laporan', icon: '📈' },
    { path: '/pengaturan', label: 'Pengaturan', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`relative bg-white shadow-lg transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📱</span>
                <span className="font-bold text-xl text-blue-600">WarungWA</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition"
              >
                ◀
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 mx-auto p-1 rounded hover:bg-gray-100 transition"
            >
              ▶
            </button>
          )}
        </div>

        {/* Shop Info */}
        {sidebarOpen && currentShop && (
          <div className="p-4 border-b bg-blue-50 flex-shrink-0">
            <p className="text-sm text-gray-600">Toko Aktif</p>
            <p className="font-semibold text-gray-900 truncate">{currentShop.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              Role: <span className="font-medium">{session?.currentRole}</span>
            </p>
          </div>
        )}

        {/* Menu Items */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              title={sidebarOpen ? '' : item.label}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
            title="Keluar"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {sidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find((item) => isActive(item.path))?.label || 'WarungWA'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {session?.userName || 'User'}
              </p>
              <p className="text-xs text-gray-500">{session?.currentRole}</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {session?.userName?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};
