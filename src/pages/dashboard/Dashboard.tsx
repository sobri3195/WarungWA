import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSessionStore } from '../../lib/stores/sessionStore';
import { db } from '../../lib/db/schema';
import type { Order, Reminder } from '../../types';
import { formatCurrency } from '../../lib/utils/whatsapp';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { currentShop } = useSessionStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    newOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
  const [topProducts, setTopProducts] = useState<Array<{ name: string; count: number }>>([]);
  const [chartData, setChartData] = useState<Array<{ day: string; revenue: number }>>([]);

  useEffect(() => {
    if (!currentShop) return;
    loadDashboardData();
  }, [currentShop]);

  const loadDashboardData = async () => {
    if (!currentShop) return;

    const orders = await db.orders
      .where('shopId')
      .equals(currentShop.id)
      .toArray();

    const newOrders = orders.filter((o) => o.status === 'NEW');
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

    setStats({
      totalOrders: orders.length,
      newOrders: newOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
    });

    const recent = await db.orders
      .where('shopId')
      .equals(currentShop.id)
      .reverse()
      .sortBy('createdAt');
    setRecentOrders(recent.slice(0, 5));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reminders = await db.reminders
      .where('dueDate')
      .between(today, tomorrow)
      .and((r) => !r.isCompleted)
      .toArray();
    setTodayReminders(reminders);

    const orderItems = await db.orderItems.toArray();
    const productCounts = orderItems.reduce((acc, item) => {
      acc[item.productName] = (acc[item.productName] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topProds = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    setTopProducts(topProds);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    const revenueByDay = last7Days.map((date) => {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd && o.status === 'COMPLETED';
      });

      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

      return {
        day: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        revenue,
      };
    });

    setChartData(revenueByDay);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Ringkasan bisnis Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📦"
          label="Total Pesanan"
          value={stats.totalOrders}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon="🆕"
          label="Pesanan Baru"
          value={stats.newOrders}
          color="bg-yellow-100 text-yellow-700"
        />
        <StatCard
          icon="✅"
          label="Selesai"
          value={stats.completedOrders}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          icon="💰"
          label="Omzet (Selesai)"
          value={`Rp ${formatCurrency(stats.totalRevenue)}`}
          color="bg-primary-100 text-primary-700"
        />
      </div>

      {/* Reminders */}
      {todayReminders.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⏰</span>
            <h3 className="font-bold text-lg">Reminder Hari Ini</h3>
          </div>
          <div className="space-y-2">
            {todayReminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center gap-2 text-sm">
                <span>•</span>
                <span>{reminder.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">Omzet 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                formatter={(value) => value !== undefined ? `Rp ${formatCurrency(Number(value))}` : ''}
              />
              <Bar dataKey="revenue" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-lg mb-4">Produk Terlaris</h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                    <span className="font-medium">{product.name}</span>
                  </div>
                  <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {product.count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Belum ada data penjualan</p>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-lg">Pesanan Terbaru</h3>
          <Link
            to="/pesanan"
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
          >
            Lihat Semua →
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/pesanan/${order.id}`}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{order.customerName}</p>
                  <p className="text-sm text-gray-500">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">
                    Rp {formatCurrency(order.total)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getStatusLabel(order.status)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              Belum ada pesanan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`${color} w-14 h-14 rounded-lg flex items-center justify-center text-3xl`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'Baru',
    CONFIRMED: 'Konfirmasi',
    PACKED: 'Dikemas',
    SHIPPED: 'Dikirim',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
}
