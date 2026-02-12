import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db, type Order, type Reminder } from '../lib/db';
import { useAppStore } from '../lib/store';
import { formatCurrency } from '../lib/whatsapp';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalOrders: number;
  newOrders: number;
  totalRevenue: number;
  pendingPayments: number;
  todayRevenue: number;
}

interface TopProduct {
  productName: string;
  totalSold: number;
  revenue: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
}

export const Dashboard = () => {
  const { currentShop } = useAppStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    newOrders: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    todayRevenue: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (currentShop) {
      loadDashboardData();
    }
  }, [currentShop]);

  const loadDashboardData = async () => {
    if (!currentShop) return;

    // Load orders
    const orders = await db.orders
      .where('shopId')
      .equals(currentShop.id)
      .toArray();

    // Calculate stats
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const newOrders = orders.filter((o) => o.status === 'BARU').length;
    const totalRevenue = orders
      .filter((o) => o.status === 'SELESAI')
      .reduce((sum, o) => sum + o.total, 0);
    const pendingPayments = orders.filter(
      (o) => o.paymentStatus !== 'LUNAS' && o.status !== 'DIBATALKAN'
    ).length;
    const todayRevenue = orders
      .filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= today && o.status === 'SELESAI';
      })
      .reduce((sum, o) => sum + o.total, 0);

    setStats({
      totalOrders: orders.length,
      newOrders,
      totalRevenue,
      pendingPayments,
      todayRevenue,
    });

    // Load top products
    const orderItems = await db.orderItems.toArray();
    const productSales = new Map<string, { name: string; sold: number; revenue: number }>();

    orderItems.forEach((item) => {
      const existing = productSales.get(item.productName) || {
        name: item.productName,
        sold: 0,
        revenue: 0,
      };
      existing.sold += item.quantity;
      existing.revenue += item.subtotal;
      productSales.set(item.productName, existing);
    });

    const topProductsList = Array.from(productSales.values())
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map((p) => ({
        productName: p.name,
        totalSold: p.sold,
        revenue: p.revenue,
      }));

    setTopProducts(topProductsList);

    // Calculate daily revenue for last 7 days
    const last7Days: DailyRevenue[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const revenue = orders
        .filter((o) => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= dayStart && orderDate < dayEnd && o.status === 'SELESAI';
        })
        .reduce((sum, o) => sum + o.total, 0);

      last7Days.push({ date: dateStr, revenue });
    }

    setDailyRevenue(last7Days);

    // Load reminders due today
    const todayStr = today.toISOString().split('T')[0];
    const todayReminders = await db.reminders
      .where('shopId')
      .equals(currentShop.id)
      .and((r) => r.dueDate <= todayStr && !r.isDone)
      .toArray();

    setReminders(todayReminders);

    // Load recent orders
    const recent = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    setRecentOrders(recent);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di {currentShop?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pesanan"
          value={stats.totalOrders.toString()}
          icon="📦"
          color="bg-blue-500"
        />
        <StatCard
          title="Pesanan Baru"
          value={stats.newOrders.toString()}
          icon="🆕"
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Omzet"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="bg-green-500"
        />
        <StatCard
          title="Belum Dibayar"
          value={stats.pendingPayments.toString()}
          icon="⏳"
          color="bg-red-500"
        />
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            🔔 Reminder Hari Ini ({reminders.length})
          </h3>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{reminder.title}</p>
                  {reminder.notes && (
                    <p className="text-sm text-gray-600">{reminder.notes}</p>
                  )}
                </div>
                <Link
                  to={reminder.orderId ? `/pesanan/${reminder.orderId}` : '#'}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Lihat
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts & Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Omzet 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                labelStyle={{ color: '#000' }}
              />
              <Bar dataKey="revenue" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-lg mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada data</p>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.productName}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-600">{product.totalSold} terjual</p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-600">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Pesanan Terbaru</h3>
          <Link to="/pesanan" className="text-blue-600 hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No. Pesanan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Belum ada pesanan
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/pesanan/${order.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    BARU: 'bg-blue-100 text-blue-800',
    KONFIRMASI: 'bg-yellow-100 text-yellow-800',
    DIKEMAS: 'bg-purple-100 text-purple-800',
    DIKIRIM: 'bg-indigo-100 text-indigo-800',
    SELESAI: 'bg-green-100 text-green-800',
    DIBATALKAN: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};
