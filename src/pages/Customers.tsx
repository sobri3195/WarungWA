import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, type Customer, type CustomerTag, generateId, now } from '../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../lib/store';
import { DataTable, type Column } from '../components/DataTable';
import { CustomerFormModal } from '../components/customers/CustomerFormModal';
import { exportToCSV } from '../lib/export';

type CustomerWithTags = Customer & {
  tags: CustomerTag[];
  orderCount?: number;
  totalSpent?: number;
};

type FilterLevel = 'ALL' | 'RETAIL' | 'RESELLER' | 'GROSIR';

export const Customers = () => {
  const navigate = useNavigate();
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const { openModal } = useModalStore();
  const [customers, setCustomers] = useState<CustomerWithTags[]>([]);
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('ALL');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentShop) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShop]);

  const loadData = async () => {
    if (!currentShop) return;

    setIsLoading(true);
    try {
      // Load customers
      const allCustomers = await db.customers
        .where('shopId')
        .equals(currentShop.id)
        .toArray();

      // Load tags
      const allTags = await db.customerTags
        .where('shopId')
        .equals(currentShop.id)
        .toArray();

      // Load tag joins
      const tagJoins = await db.customerTagJoin.toArray();

      // Load orders for statistics
      const orders = await db.orders
        .where('shopId')
        .equals(currentShop.id)
        .toArray();

      // Enrich customers with tags and statistics
      const enrichedCustomers: CustomerWithTags[] = await Promise.all(
        allCustomers.map(async (customer) => {
          // Get customer tags
          const customerTagIds = tagJoins
            .filter((tj) => tj.customerId === customer.id)
            .map((tj) => tj.tagId);
          const customerTags = allTags.filter((tag) =>
            customerTagIds.includes(tag.id)
          );

          // Calculate order statistics
          const customerOrders = orders.filter((o) => o.customerId === customer.id);
          const orderCount = customerOrders.length;
          const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);

          return {
            ...customer,
            tags: customerTags,
            orderCount,
            totalSpent,
          };
        })
      );

      // Sort by name
      enrichedCustomers.sort((a, b) => a.name.localeCompare(b.name));

      setCustomers(enrichedCustomers);
      setTags(allTags);
    } catch (error) {
      console.error('Failed to load customers:', error);
      addToast({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Terjadi kesalahan saat memuat data pelanggan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomer = () => {
    openModal(
      <CustomerFormModal
        onSuccess={loadData}
        availableTags={tags}
      />
    );
  };

  const handleEditCustomer = (customer: CustomerWithTags) => {
    openModal(
      <CustomerFormModal
        customer={customer}
        onSuccess={loadData}
        availableTags={tags}
      />
    );
  };

  const handleDeleteCustomer = async (customer: CustomerWithTags) => {
    if (!confirm(`Hapus pelanggan ${customer.name}? Data tidak dapat dikembalikan.`)) {
      return;
    }

    try {
      // Check if customer has orders
      const orderCount = await db.orders
        .where('customerId')
        .equals(customer.id)
        .count();

      if (orderCount > 0) {
        addToast({
          type: 'error',
          title: 'Tidak Dapat Dihapus',
          message: `Pelanggan memiliki ${orderCount} pesanan. Hapus pesanan terlebih dahulu.`,
        });
        return;
      }

      // Delete tag joins
      const tagJoins = await db.customerTagJoin
        .where('customerId')
        .equals(customer.id)
        .toArray();
      await db.customerTagJoin.bulkDelete(tagJoins.map((tj) => tj.id));

      // Delete customer
      await db.customers.delete(customer.id);

      // Add activity log
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

      loadData();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Terjadi kesalahan saat menghapus pelanggan',
      });
    }
  };

  const handleCustomerClick = (customer: CustomerWithTags) => {
    navigate(`/pelanggan/${customer.id}`);
  };

  const handleExportCSV = () => {
    const csvData = customers.map((customer) => ({
      'Nama': customer.name,
      'No. HP': customer.phone,
      'Email': customer.email || '-',
      'Alamat': customer.address || '-',
      'Level': customer.level,
      'Tag': customer.tags.map((t) => t.name).join(', ') || '-',
      'Total Pesanan': customer.orderCount || 0,
      'Total Belanja': customer.totalSpent || 0,
      'Catatan': customer.notes || '-',
      'Tanggal Dibuat': new Date(customer.createdAt).toLocaleDateString('id-ID'),
    }));

    exportToCSV(csvData, `pelanggan-${Date.now()}.csv`);

    addToast({
      type: 'success',
      title: 'Export Berhasil',
      message: 'Data pelanggan berhasil di-export',
    });
  };

  // Apply filters
  const filteredCustomers = customers.filter((customer) => {
    if (filterLevel !== 'ALL' && customer.level !== filterLevel) {
      return false;
    }
    if (filterTag !== 'ALL') {
      const hasTag = customer.tags.some((tag) => tag.id === filterTag);
      if (!hasTag) return false;
    }
    return true;
  });

  // Statistics
  const stats = {
    total: customers.length,
    retail: customers.filter((c) => c.level === 'RETAIL').length,
    reseller: customers.filter((c) => c.level === 'RESELLER').length,
    grosir: customers.filter((c) => c.level === 'GROSIR').length,
  };

  // Table columns
  const columns: Column<CustomerWithTags>[] = [
    {
      key: 'name',
      label: 'Nama',
      sortable: true,
      render: (customer) => (
        <div>
          <p className="font-medium text-gray-900">{customer.name}</p>
          <p className="text-xs text-gray-500">{customer.phone}</p>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (customer) => (
        <span className="text-sm text-gray-600">
          {customer.email || '-'}
        </span>
      ),
    },
    {
      key: 'level',
      label: 'Level',
      sortable: true,
      render: (customer) => <LevelBadge level={customer.level} />,
    },
    {
      key: 'tags',
      label: 'Tag',
      render: (customer) => (
        <div className="flex flex-wrap gap-1">
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
            <span className="text-xs text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'orderCount',
      label: 'Pesanan',
      sortable: true,
      render: (customer) => (
        <span className="text-sm font-medium">
          {customer.orderCount || 0}
        </span>
      ),
    },
    {
      key: 'totalSpent',
      label: 'Total Belanja',
      sortable: true,
      render: (customer) => (
        <span className="text-sm font-semibold text-gray-900">
          Rp {(customer.totalSpent || 0).toLocaleString('id-ID')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (customer) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditCustomer(customer);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCustomer(customer);
            }}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Hapus
          </button>
        </div>
      ),
    },
  ];

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-600 mt-1">Kelola data pelanggan Anda</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            📥 Export CSV
          </button>
          <button
            onClick={handleAddCustomer}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Tambah Pelanggan
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Pelanggan</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Retail</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.retail}</p>
            </div>
            <div className="text-4xl">🛒</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Reseller</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.reseller}</p>
            </div>
            <div className="text-4xl">🏪</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Grosir</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.grosir}</p>
            </div>
            <div className="text-4xl">🏭</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value as FilterLevel)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Level</option>
            <option value="RETAIL">Retail</option>
            <option value="RESELLER">Reseller</option>
            <option value="GROSIR">Grosir</option>
          </select>

          {/* Tag Filter */}
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          {/* Customer Count */}
          <div className="ml-auto text-sm text-gray-600">
            Menampilkan: <span className="font-semibold">{filteredCustomers.length}</span> pelanggan
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredCustomers}
        columns={columns}
        keyExtractor={(customer) => customer.id}
        onRowClick={handleCustomerClick}
        searchable
        searchKeys={['name', 'phone', 'email']}
        emptyMessage="Belum ada pelanggan. Tambahkan pelanggan pertama Anda!"
      />
    </div>
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
