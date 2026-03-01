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
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Products } from './pages/Products';
import { TemplateChat } from './pages/TemplateChat';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { SeoManager } from './components/SeoManager';

function App() {
  const { session, isLoading, loadSession } = useAppStore();

  useEffect(() => {
    void initializeApp();
  }, [loadSession]);

  async function initializeApp() {
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
  }

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
      <SeoManager />
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
                  <Route path="/pelanggan" element={<Customers />} />
                  <Route path="/pelanggan/:id" element={<CustomerDetail />} />
                  <Route path="/produk" element={<Products />} />
                  <Route path="/template-chat" element={<TemplateChat />} />
                  <Route path="/laporan" element={<Reports />} />
                  <Route path="/pengaturan" element={<Settings />} />
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

export default App;
