import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  db,
  type Customer,
  type CustomerTag,
  type Order,
  type ActivityLog,
  generateId,
  now,
} from '../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../lib/store';
import { DataTable, type Column } from '../components/DataTable';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { formatCurrency, generateWhatsAppLink } from '../lib/whatsapp';

type CustomerWithTags = Customer & {
  tags: CustomerTag[];
};

export const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const { openModal } = useModalStore();

  const [customer, setCustomer] = useState<CustomerWithTags | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [availableTags, setAvailableTags] = useState<CustomerTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'activities'>('orders');

  useEffect(() => {
    if (currentShop && id) {
      loadCustomerData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShop, id]);

  const loadCustomerData = async () => {
    if (!currentShop || !id) return;

    setIsLoading(true);
    try {
      // Load customer
      const customerData = await db.customers.get(id);
      if (!customerData || customerData.shopId !== currentShop.id) {
        addToast({
          type: 'error',
          title: 'Pelanggan Tidak Ditemukan',
          message: 'Pelanggan tidak ditemukan atau tidak dapat diakses',
        });
        navigate('/pelanggan');
        return;
      }

      // Load tags
      const allTags = await db.customerTags
        .where('shopId')
        .equals(currentShop.id)
        .toArray();

      const tagJoins = await db.customerTagJoin
        .where('customerId')
        .equals(id)
        .toArray();

      const customerTagIds = tagJoins.map((tj) => tj.tagId);
      const customerTags = allTags.filter((tag) => customerTagIds.includes(tag.id));

      setCustomer({
        ...customerData,
        tags: customerTags,
      });
      setAvailableTags(allTags);

      // Load orders
      const customerOrders = await db.orders
        .where('customerId')
        .equals(id)
        .toArray();

      customerOrders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(customerOrders);

      // Load activities
      const customerActivities = await db.activityLogs
        .where('entityId')
        .equals(id)
        .toArray();

      customerActivities.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setActivities(customerActivities);
    } catch (error) {
      console.error('Failed to load customer data:', error);
      addToast({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Terjadi kesalahan saat memuat data pelanggan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = () => {
    if (!customer) return;
    openModal(
      <CustomerFormModal
        customer={customer}
        onSuccess={loadCustomerData}
        availableTags={availableTags}
      />
    );
  };

  const handleDeleteCustomer = async () => {
    if (!customer) return;

    if (!confirm(`Hapus pelanggan ${customer.name}? Data tidak dapat dikembalikan.`)) {
      return;
    }

    try {
      if (orders.length > 0) {
        addToast({
          type: 'error',
          title: 'Tidak Dapat Dihapus',
          message: `Pelanggan memiliki ${orders.length} pesanan. Hapus pesanan terlebih dahulu.`,
        });
        return;
      }

      const tagJoins = await db.customerTagJoin
        .where('customerId')
        .equals(customer.id)
        .toArray();
      await db.customerTagJoin.bulkDelete(tagJoins.map((tj) => tj.id));

      await db.customers.delete(customer.id);

      await db.activityLogs.add({
        id: generateId(),
        shopId: currentShop!.id,
        entityType: 'CUSTOMER',
        entityId: customer.id,
        action: 'DELETED',
        description: `Pelanggan ${customer.name} dihapus`,
        performedBy: session?.userName || 'System',
        createdAt: now(),
      });

      addToast({
        type: 'success',
        title: 'Pelanggan Dihapus',
        message: `${customer.name} berhasil dihapus`,
      });

      navigate('/pelanggan');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Terjadi kesalahan saat menghapus pelanggan',
      });
    }
  };

  const handleWhatsApp = () => {
    if (!customer) return;
    const message = `Halo ${customer.name}!`;
    const link = generateWhatsAppLink(customer.phone, message);
    window.open(link, '_blank');
  };

  const handleOrderClick = (order: Order) => {
    navigate(`/pesanan/${order.id}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pelanggan...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const stats = {
    totalOrders: orders.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
    averageOrder: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
      : 0,
    completedOrders: orders.filter((o) => o.status === 'SELESAI').length,
  };

  const orderColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      label: 'No. Pesanan',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-blue-600">#{order.orderNumber}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'paymentStatus',
      label: 'Pembayaran',
      render: (order) => <PaymentBadge status={order.paymentStatus} />,
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (order) => (
        <span className="font-semibold">{formatCurrency(order.total)}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Tanggal',
      sortable: true,
      render: (order) => (
        <span className="text-sm">
          {new Date(order.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/pelanggan')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Kembali
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-600 mt-1">{customer.phone}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleWhatsApp}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            💬 WhatsApp
          </button>
          <button
            onClick={handleEditCustomer}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDeleteCustomer}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium"
          >
            🗑️ Hapus
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Informasi Pelanggan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{customer.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Level</p>
            <p>
              <LevelBadge level={customer.level} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Alamat</p>
            <p className="font-medium">{customer.address || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tag</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {customer.tags.length > 0 ? (
                customer.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-400">-</span>
              )}
            </div>
          </div>
          {customer.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Catatan</p>
              <p className="font-medium whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Bergabung</p>
            <p className="font-medium">
              {new Date(customer.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-600 text-sm">Total Pesanan</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-600 text-sm">Total Belanja</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {formatCurrency(stats.totalSpent)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-600 text-sm">Rata-rata Pesanan</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {formatCurrency(stats.averageOrder)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-gray-600 text-sm">Pesanan Selesai</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.completedOrders}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Riwayat Pesanan ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-6 py-4 font-medium border-b-2 transition-colors ${
                activeTab === 'activities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Aktivitas ({activities.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'orders' ? (
            orders.length > 0 ? (
              <DataTable
                data={orders}
                columns={orderColumns}
                keyExtractor={(order) => order.id}
                onRowClick={handleOrderClick}
                emptyMessage="Belum ada pesanan"
              />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600">Belum ada pesanan dari pelanggan ini</p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="text-2xl">📝</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>{activity.performedBy}</span>
                        <span>•</span>
                        <span>
                          {new Date(activity.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600">Belum ada aktivitas</p>
                </div>
              )}
            </div>
          )}
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
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    BELUM_BAYAR: 'bg-red-100 text-red-800',
    DP: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
  };

  const labels: Record<string, string> = {
    BELUM_BAYAR: 'Belum Bayar',
    DP: 'DP',
    LUNAS: 'Lunas',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};

const LevelBadge = ({ level }: { level: string }) => {
  const colors: Record<string, string> = {
    RETAIL: 'bg-blue-100 text-blue-800',
    RESELLER: 'bg-purple-100 text-purple-800',
    GROSIR: 'bg-orange-100 text-orange-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${colors[level]}`}>
      {level}
    </span>
  );
};
