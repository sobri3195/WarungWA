import { useCallback, useEffect, useMemo, useState } from 'react';
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
  completedOrders: number;
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
    completedOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  const loadDashboardData = useCallback(async () => {
    if (!currentShop) return;

    const orders = await db.orders.where('shopId').equals(currentShop.id).toArray();

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const newOrders = orders.filter((o) => o.status === 'BARU').length;
    const completedOrders = orders.filter((o) => o.status === 'SELESAI').length;
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
      completedOrders,
    });

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

    const last7Days: DailyRevenue[] = [];
    for (let i = 6; i >= 0; i -= 1) {
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

    const todayStr = today.toISOString().split('T')[0];
    const todayReminders = await db.reminders
      .where('shopId')
      .equals(currentShop.id)
      .and((r) => r.dueDate <= todayStr && !r.isDone)
      .toArray();

    setReminders(todayReminders);

    const recent = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    setRecentOrders(recent);
  }, [currentShop]);

  useEffect(() => {
    if (currentShop) {
      void loadDashboardData();
    }
  }, [currentShop, loadDashboardData]);

  const conversionRate = useMemo(() => {
    if (!stats.totalOrders) return 0;
    return Math.round((stats.completedOrders / stats.totalOrders) * 100);
  }, [stats.completedOrders, stats.totalOrders]);

  return (
    <div className="p-6 space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white shadow-lg">
        <p className="text-sm text-emerald-100">Ringkasan Hari Ini</p>
        <h1 className="text-3xl font-bold">Halo, tim {currentShop?.name}</h1>
        <p className="mt-2 max-w-2xl text-emerald-50">
          Pantau performa penjualan, tindak lanjuti reminder, dan percepat proses closing WhatsApp.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/pesanan" className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30">
            Kelola Pesanan
          </Link>
          <Link to="/laporan" className="rounded-lg bg-white text-emerald-700 px-4 py-2 text-sm font-semibold hover:bg-emerald-50">
            Buka Laporan
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total Pesanan" value={stats.totalOrders.toString()} icon="📦" accent="from-blue-500 to-indigo-500" />
        <StatCard title="Pesanan Baru" value={stats.newOrders.toString()} icon="🆕" accent="from-amber-400 to-orange-500" />
        <StatCard title="Total Omzet" value={formatCurrency(stats.totalRevenue)} icon="💰" accent="from-emerald-500 to-teal-500" />
        <StatCard title="Belum Dibayar" value={stats.pendingPayments.toString()} icon="⏳" accent="from-rose-500 to-red-500" />
        <StatCard title="Closing Rate" value={`${conversionRate}%`} icon="🎯" accent="from-violet-500 to-fuchsia-500" />
      </div>

      {reminders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔔 Reminder Hari Ini ({reminders.length})</h3>
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between gap-3 rounded-lg bg-white p-3">
                <div>
                  <p className="font-medium text-gray-900">{reminder.title}</p>
                  {reminder.notes && <p className="text-sm text-gray-600">{reminder.notes}</p>}
                </div>
                <Link
                  to={reminder.orderId ? `/pesanan/${reminder.orderId}` : '/pesanan'}
                  className="text-blue-600 hover:underline text-sm whitespace-nowrap"
                >
                  Tindak Lanjut
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Omzet 7 Hari Terakhir</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value as number)} labelStyle={{ color: '#000' }} />
              <Bar dataKey="revenue" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-3 text-sm text-gray-500">Omzet hari ini: <strong>{formatCurrency(stats.todayRevenue)}</strong></p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-lg mb-4">Produk Terlaris</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada data</p>
            ) : (
              topProducts.map((product, index) => (
                <div key={product.productName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-gray-400">{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-600">{product.totalSold} terjual</p>
                    </div>
                  </div>
                  <p className="font-semibold text-blue-600">{formatCurrency(product.revenue)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">Pesanan Terbaru</h3>
          <Link to="/pesanan" className="text-blue-600 hover:underline">Lihat Semua</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pesanan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Belum ada pesanan</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/pesanan/${order.id}`} className="text-blue-600 hover:underline font-medium">
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatCurrency(order.total)}</td>
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
  accent: string;
}

const StatCard = ({ title, value, icon, accent }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`bg-gradient-to-r ${accent} w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
        {icon}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    BARU: 'bg-blue-100 text-blue-800',
    KONFIRMASI: 'bg-yellow-100 text-yellow-800',
    DIKEMAS: 'bg-purple-100 text-purple-800',
    DIKIRIM: 'bg-indigo-100 text-indigo-800',
    SELESAI: 'bg-green-100 text-green-800',
    DIBATALKAN: 'bg-red-100 text-red-800',
  };

  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};
