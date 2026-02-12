import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { orderService } from '../../lib/services/orderService';
import type { Order } from '../../types';
import { OrderKanban } from '../../components/orders/OrderKanban';
import { Button } from '../../components/ui/Button';

export function OrdersPage() {
  const navigate = useNavigate();
  const { currentShop } = useSessionStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (currentShop) {
      loadOrders();
    }
  }, [currentShop]);

  const loadOrders = async () => {
    if (!currentShop) return;
    setIsLoading(true);
    try {
      const data = await orderService.getAll(currentShop.id);
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    navigate(`/pesanan/${order.id}`);
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query) ||
      order.id.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pesanan</h1>
          <p className="text-gray-600">Kelola semua pesanan Anda</p>
        </div>
        <Button onClick={() => navigate('/pesanan/baru')}>
          <span className="text-xl">+</span>
          Buat Pesanan
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Cari nama, nomor HP, atau Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === 'kanban'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📊 Kanban
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                view === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {view === 'kanban' ? (
        <OrderKanban
          orders={filteredOrders}
          onRefresh={loadOrders}
          onOrderClick={handleOrderClick}
        />
      ) : (
        <OrderList orders={filteredOrders} onOrderClick={handleOrderClick} />
      )}
    </div>
  );
}

interface OrderListProps {
  orders: Order[];
  onOrderClick: (order: Order) => void;
}

function OrderList({ orders, onOrderClick }: OrderListProps) {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      NEW: { label: 'Baru', color: 'bg-blue-100 text-blue-700' },
      CONFIRMED: { label: 'Konfirmasi', color: 'bg-yellow-100 text-yellow-700' },
      PACKED: { label: 'Dikemas', color: 'bg-purple-100 text-purple-700' },
      SHIPPED: { label: 'Dikirim', color: 'bg-orange-100 text-orange-700' },
      COMPLETED: { label: 'Selesai', color: 'bg-green-100 text-green-700' },
      CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
    };
    return badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pelanggan
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const statusBadge = getStatusBadge(order.status);
            return (
              <tr
                key={order.id}
                onClick={() => onOrderClick(order)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-sm font-semibold">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.customerPhone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-bold text-primary-600">
                    Rp {new Intl.NumberFormat('id-ID').format(order.total)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`${statusBadge.color} px-3 py-1 rounded-full text-xs font-semibold`}
                  >
                    {statusBadge.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Tidak ada pesanan yang ditemukan
        </div>
      )}
    </div>
  );
}
