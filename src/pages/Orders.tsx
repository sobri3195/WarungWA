import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, type Order, type OrderStatus, generateId, now } from '../lib/db';
import { useAppStore, useToastStore } from '../lib/store';
import { KanbanBoard } from '../components/KanbanBoard';
import { DataTable, type Column } from '../components/DataTable';
import { formatCurrency } from '../lib/whatsapp';

type ViewMode = 'kanban' | 'list';

export const Orders = () => {
  const navigate = useNavigate();
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [filterPayment, setFilterPayment] = useState<string>('ALL');

  useEffect(() => {
    if (currentShop) {
      loadOrders();
    }
  }, [currentShop]);

  const loadOrders = async () => {
    if (!currentShop) return;

    const allOrders = await db.orders
      .where('shopId')
      .equals(currentShop.id)
      .toArray();

    // Sort by created date (newest first)
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setOrders(allOrders);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      // Update order
      await db.orders.update(orderId, {
        status: newStatus,
        updatedAt: now(),
      });

      // Add status history
      await db.orderStatusHistory.add({
        id: generateId(),
        orderId,
        status: newStatus,
        changedBy: session?.userName || 'System',
        createdAt: now(),
      });

      // Add activity log
      await db.activityLogs.add({
        id: generateId(),
        shopId: order.shopId,
        entityType: 'ORDER',
        entityId: orderId,
        action: 'STATUS_CHANGED',
        description: `Status pesanan #${order.orderNumber} diubah menjadi ${newStatus}`,
        performedBy: session?.userName || 'System',
        createdAt: now(),
      });

      addToast({
        type: 'success',
        title: 'Status Diupdate',
        message: `Pesanan #${order.orderNumber} dipindahkan ke ${newStatus}`,
      });

      loadOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      addToast({
        type: 'error',
        title: 'Gagal Update Status',
        message: 'Terjadi kesalahan saat mengupdate status pesanan',
      });
    }
  };

  const handleOrderClick = (order: Order) => {
    navigate(`/pesanan/${order.id}`);
  };

  // Apply filters
  const filteredOrders = orders.filter((order) => {
    if (filterStatus !== 'ALL' && order.status !== filterStatus) {
      return false;
    }
    if (filterPayment !== 'ALL' && order.paymentStatus !== filterPayment) {
      return false;
    }
    return true;
  });

  // Table columns
  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      label: 'No. Pesanan',
      sortable: true,
      render: (order) => (
        <span className="font-semibold text-blue-600">#{order.orderNumber}</span>
      ),
    },
    {
      key: 'customerName',
      label: 'Pelanggan',
      sortable: true,
      render: (order) => (
        <div>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-xs text-gray-500">{order.customerPhone}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: 'paymentStatus',
      label: 'Pembayaran',
      sortable: true,
      render: (order) => <PaymentBadge status={order.paymentStatus} />,
    },
    {
      key: 'priority',
      label: 'Prioritas',
      render: (order) =>
        order.priority === 'URGENT' ? (
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">URGENT</span>
        ) : (
          <span className="text-xs text-gray-500">Normal</span>
        ),
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pesanan</h1>
          <p className="text-gray-600 mt-1">Kelola pesanan Anda</p>
        </div>
        <button
          onClick={() => navigate('/pesanan/buat')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          + Pesanan Baru
        </button>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              📊 Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600'
              }`}
            >
              📋 List
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="BARU">Baru</option>
            <option value="KONFIRMASI">Konfirmasi</option>
            <option value="DIKEMAS">Dikemas</option>
            <option value="DIKIRIM">Dikirim</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>

          {/* Payment Filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Pembayaran</option>
            <option value="BELUM_BAYAR">Belum Bayar</option>
            <option value="DP">DP</option>
            <option value="LUNAS">Lunas</option>
          </select>

          {/* Order Count */}
          <div className="ml-auto text-sm text-gray-600">
            Total: <span className="font-semibold">{filteredOrders.length}</span> pesanan
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          orders={filteredOrders}
          onOrderClick={handleOrderClick}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <DataTable
          data={filteredOrders}
          columns={columns}
          keyExtractor={(order) => order.id}
          onRowClick={handleOrderClick}
          searchable
          searchKeys={['orderNumber', 'customerName', 'customerPhone']}
          emptyMessage="Belum ada pesanan"
        />
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: OrderStatus }) => {
  const colors: Record<OrderStatus, string> = {
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
