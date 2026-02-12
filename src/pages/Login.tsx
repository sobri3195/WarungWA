import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, type Shop, now } from '../lib/db';
import { useAppStore } from '../lib/store';

export const Login = () => {
  const navigate = useNavigate();
  const { setSession } = useAppStore();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'OWNER' | 'ADMIN' | 'STAFF'>('OWNER');
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    const allShops = await db.shops.toArray();
    setShops(allShops);
    if (allShops.length > 0) {
      setSelectedShop(allShops[0].id);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedShop || !userName.trim()) {
      alert('Silakan pilih toko dan masukkan nama');
      return;
    }

    // Update or create session
    await db.appSession.put({
      id: 'current',
      currentShopId: selectedShop,
      currentRole: selectedRole,
      userName: userName.trim(),
      updatedAt: now(),
    });

    // Reload session in store
    await useAppStore.getState().loadSession();

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">WarungWA</h1>
          <p className="text-gray-600">
            Kelola katalog, pelanggan, dan pesanan — langsung closing lewat WhatsApp
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Shop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Toko
            </label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {shops.length === 0 ? (
                <option value="">Memuat...</option>
              ) : (
                shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('OWNER')}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                  selectedRole === 'OWNER'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                👑 Owner
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('ADMIN')}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                  selectedRole === 'ADMIN'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                ⚙️ Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('STAFF')}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                  selectedRole === 'STAFF'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                👤 Staff
              </button>
            </div>
          </div>

          {/* User Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Anda
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Masukkan nama"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Masuk
          </button>
        </form>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Mode Demo:</strong> Aplikasi ini berjalan offline di browser Anda.
            Data disimpan lokal menggunakan IndexedDB.
          </p>
        </div>

        {/* Role Info */}
        <div className="mt-4 text-xs text-gray-600 space-y-1">
          <p><strong>Owner:</strong> Akses penuh ke semua fitur</p>
          <p><strong>Admin:</strong> Kelola produk, pesanan, dan pelanggan</p>
          <p><strong>Staff:</strong> Lihat dan update pesanan</p>
        </div>
      </div>
    </div>
  );
};
