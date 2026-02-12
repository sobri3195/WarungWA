import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { db, seedInitialData } from './lib/db';
import { useAppStore } from './lib/store';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast';
import { ModalContainer } from './components/Modal';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';

function App() {
  const { session, isLoading, loadSession } = useAppStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await db.open();
      
      // Seed initial data if needed
      await seedInitialData();
      
      // Load session
      await loadSession();
      
      console.log('✅ App initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Memuat WarungWA...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <ModalContainer />
      
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={session ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            session ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/pesanan" element={<Orders />} />
                  <Route path="/pesanan/:id" element={<OrderDetail />} />
                  <Route path="/pelanggan" element={<PlaceholderPage title="Pelanggan" />} />
                  <Route path="/produk" element={<PlaceholderPage title="Produk" />} />
                  <Route path="/template-chat" element={<PlaceholderPage title="Template Chat" />} />
                  <Route path="/laporan" element={<PlaceholderPage title="Laporan" />} />
                  <Route path="/pengaturan" element={<PlaceholderPage title="Pengaturan" />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

// Placeholder component for pages not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-4">
          Halaman ini sedang dalam pengembangan.
        </p>
        <div className="text-6xl mb-4">🚧</div>
        <p className="text-sm text-gray-500">
          Fitur lengkap akan ditambahkan dalam versi berikutnya.
        </p>
      </div>
    </div>
  );
};

export default App;
