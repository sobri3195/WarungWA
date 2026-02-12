import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { db } from '../../lib/db/schema';
import { seedDatabase } from '../../lib/db/seed';
import type { Shop, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';

export function LoginPage() {
  const navigate = useNavigate();
  const { session, loadSession } = useSessionStore();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShop, setSelectedShop] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('OWNER');
  const [userName, setUserName] = useState('Admin');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
  }, [session, navigate]);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await seedDatabase();
      await loadSession();
      
      const allShops = await db.shops.toArray();
      setShops(allShops);
      if (allShops.length > 0) {
        setSelectedShop(allShops[0].id);
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const handleLogin = async () => {
    if (!selectedShop || !userName.trim()) return;

    setIsLoading(true);
    try {
      const existingSession = await db.appSession.get('main');
      
      const sessionData = {
        id: 'main',
        currentShopId: selectedShop,
        currentRole: selectedRole,
        userName: userName.trim(),
        updatedAt: new Date(),
      };

      if (existingSession) {
        await db.appSession.put(sessionData);
      } else {
        await db.appSession.add(sessionData);
      }

      await loadSession();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-4xl font-bold text-primary-600 mb-2">WarungWA</h1>
          <p className="text-gray-600">
            Kelola katalog, pelanggan, dan pesanan — langsung closing lewat WhatsApp.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Anda
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pilih Toko
            </label>
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role (Demo)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['OWNER', 'ADMIN', 'STAFF'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`py-3 rounded-lg font-semibold transition-colors ${
                    selectedRole === role
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {role === 'OWNER' && 'Owner'}
                  {role === 'ADMIN' && 'Admin'}
                  {role === 'STAFF' && 'Staff'}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleLogin}
            isLoading={isLoading}
            disabled={!selectedShop || !userName.trim()}
            className="w-full mt-6"
            size="lg"
          >
            Masuk ke Dashboard
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            <strong>Note:</strong> Ini adalah aplikasi frontend-only. Semua data disimpan di
            browser Anda menggunakan IndexedDB. Role switcher berfungsi sebagai demo saja.
          </p>
        </div>
      </div>
    </div>
  );
}
