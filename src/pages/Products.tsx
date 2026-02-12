import { useEffect, useState } from 'react';
import { db, type Product, type Category, generateId, now } from '../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../lib/store';
import { DataTable, type Column } from '../components/DataTable';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { CategoryFormModal } from '../components/products/CategoryFormModal';
import { exportToCSV, exportProductsToExcel } from '../lib/export';

type ProductWithCategory = Product & {
  categoryName?: string;
  variantCount?: number;
};

type FilterStatus = 'ALL' | 'ACTIVE' | 'INACTIVE';

export const Products = () => {
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const { openModal } = useModalStore();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
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
      const allProducts = await db.products
        .where('shopId')
        .equals(currentShop.id)
        .toArray();

      const allCategories = await db.categories
        .where('shopId')
        .equals(currentShop.id)
        .toArray();

      const categoryMap = new Map(allCategories.map((c) => [c.id, c.name]));

      const enrichedProducts: ProductWithCategory[] = await Promise.all(
        allProducts.map(async (product) => {
          const variantCount = await db.productVariants
            .where('productId')
            .equals(product.id)
            .count();

          return {
            ...product,
            categoryName: product.categoryId ? categoryMap.get(product.categoryId) : undefined,
            variantCount,
          };
        })
      );

      enrichedProducts.sort((a, b) => a.name.localeCompare(b.name));

      setProducts(enrichedProducts);
      setCategories(allCategories);
    } catch (error) {
      console.error('Failed to load products:', error);
      addToast({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Terjadi kesalahan saat memuat data produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = () => {
    openModal(
      <ProductFormModal
        onSuccess={loadData}
        categories={categories}
      />
    );
  };

  const handleEditProduct = (product: ProductWithCategory) => {
    openModal(
      <ProductFormModal
        product={product}
        onSuccess={loadData}
        categories={categories}
      />
    );
  };

  const handleDeleteProduct = async (product: ProductWithCategory) => {
    if (!confirm(`Hapus produk ${product.name}? Data tidak dapat dikembalikan.`)) {
      return;
    }

    try {
      const orderItemCount = await db.orderItems
        .where('productId')
        .equals(product.id)
        .count();

      if (orderItemCount > 0) {
        addToast({
          type: 'error',
          title: 'Tidak Dapat Dihapus',
          message: `Produk digunakan dalam ${orderItemCount} item pesanan. Nonaktifkan produk sebagai gantinya.`,
        });
        return;
      }

      const variants = await db.productVariants
        .where('productId')
        .equals(product.id)
        .toArray();
      await db.productVariants.bulkDelete(variants.map((v) => v.id));

      await db.products.delete(product.id);

      await db.activityLogs.add({
        id: generateId(),
        shopId: currentShop!.id,
        entityType: 'PRODUCT',
        entityId: product.id,
        action: 'DELETED',
        description: `Produk ${product.name} dihapus`,
        performedBy: session?.userName || 'System',
        createdAt: now(),
      });

      addToast({
        type: 'success',
        title: 'Produk Dihapus',
        message: `${product.name} berhasil dihapus`,
      });

      loadData();
    } catch (error) {
      console.error('Failed to delete product:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Terjadi kesalahan saat menghapus produk',
      });
    }
  };

  const handleToggleStatus = async (product: ProductWithCategory) => {
    try {
      await db.products.update(product.id, {
        isActive: !product.isActive,
        updatedAt: now(),
      });

      await db.activityLogs.add({
        id: generateId(),
        shopId: currentShop!.id,
        entityType: 'PRODUCT',
        entityId: product.id,
        action: 'UPDATED',
        description: `Produk ${product.name} ${!product.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
        performedBy: session?.userName || 'System',
        createdAt: now(),
      });

      addToast({
        type: 'success',
        title: 'Status Diupdate',
        message: `${product.name} berhasil ${!product.isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      });

      loadData();
    } catch (error) {
      console.error('Failed to toggle status:', error);
      addToast({
        type: 'error',
        title: 'Gagal Mengupdate',
        message: 'Terjadi kesalahan saat mengupdate status produk',
      });
    }
  };

  const handleManageCategories = () => {
    openModal(
      <CategoryFormModal
        onSuccess={loadData}
        categories={categories}
      />
    );
  };

  const handleExportCSV = () => {
    const csvData = filteredProducts.map((product) => ({
      'SKU': product.sku || '-',
      'Nama': product.name,
      'Kategori': product.categoryName || '-',
      'Harga': product.basePrice,
      'Deskripsi': product.description || '-',
      'Varian': product.variantCount || 0,
      'Status': product.isActive ? 'Aktif' : 'Nonaktif',
      'Tanggal Dibuat': new Date(product.createdAt).toLocaleDateString('id-ID'),
    }));

    exportToCSV(csvData, `produk-${Date.now()}.csv`);

    addToast({
      type: 'success',
      title: 'Export Berhasil',
      message: 'Data produk berhasil di-export',
    });
  };

  const handleExportExcel = async () => {
    if (!currentShop) return;
    
    try {
      await exportProductsToExcel(currentShop.id);
      addToast({
        type: 'success',
        title: 'Export Berhasil',
        message: 'Data produk berhasil di-export ke Excel',
      });
    } catch (error) {
      console.error('Export error:', error);
      addToast({
        type: 'error',
        title: 'Export Gagal',
        message: 'Terjadi kesalahan saat export',
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filterCategory !== 'ALL' && product.categoryId !== filterCategory) {
      return false;
    }
    if (filterStatus === 'ACTIVE' && !product.isActive) {
      return false;
    }
    if (filterStatus === 'INACTIVE' && product.isActive) {
      return false;
    }
    return true;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    inactive: products.filter((p) => !p.isActive).length,
    categories: categories.length,
  };

  const columns: Column<ProductWithCategory>[] = [
    {
      key: 'name',
      label: 'Produk',
      sortable: true,
      render: (product) => (
        <div>
          <p className="font-medium text-gray-900">{product.name}</p>
          {product.sku && (
            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
          )}
          {product.categoryName && (
            <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {product.categoryName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Deskripsi',
      render: (product) => (
        <span className="text-sm text-gray-600 line-clamp-2">
          {product.description || '-'}
        </span>
      ),
    },
    {
      key: 'basePrice',
      label: 'Harga',
      sortable: true,
      render: (product) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Rp {product.basePrice.toLocaleString('id-ID')}
          </p>
          {(product.variantCount ?? 0) > 0 && (
            <p className="text-xs text-gray-500">
              {product.variantCount} varian
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (product) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            product.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {product.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Aksi',
      render: (product) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditProduct(product);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(product);
            }}
            className="text-amber-600 hover:text-amber-800 text-sm font-medium"
          >
            {product.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteProduct(product);
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
          <p className="mt-4 text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600 mt-1">Kelola katalog produk Anda</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleManageCategories}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
          >
            📁 Kelola Kategori
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium"
          >
            📥 Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 font-medium"
          >
            📊 Export Excel
          </button>
          <button
            onClick={handleAddProduct}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            + Tambah Produk
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Produk</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Aktif</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Nonaktif</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="text-4xl">⏸️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Kategori</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.categories}</p>
            </div>
            <div className="text-4xl">📁</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="INACTIVE">Nonaktif</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Menampilkan: <span className="font-semibold">{filteredProducts.length}</span> produk
          </div>
        </div>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        keyExtractor={(product) => product.id}
        onRowClick={handleEditProduct}
        searchable
        searchKeys={['name', 'sku', 'description']}
        emptyMessage="Belum ada produk. Tambahkan produk pertama Anda!"
      />
    </div>
  );
};
