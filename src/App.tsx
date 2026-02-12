import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSessionStore } from './lib/stores/sessionStore';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ToastContainer } from './components/ui/Toast';
import { LoginPage } from './pages/login/LoginPage';
import { Dashboard } from './pages/dashboard/Dashboard';
import { OrdersPage } from './pages/orders/OrdersPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSessionStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { loadSession } = useSessionStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pesanan"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <OrdersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/produk"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Halaman Produk
                  </h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pelanggan"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Halaman Pelanggan
                  </h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/template-chat"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Halaman Template Chat
                  </h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/laporan"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Halaman Laporan
                  </h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pengaturan"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Halaman Pengaturan
                  </h2>
                  <p className="text-gray-600">Coming soon...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
