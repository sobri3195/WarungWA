import { useState } from 'react';
import { db, type Category, generateId, now } from '../../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../../lib/store';

interface CategoryFormModalProps {
  onSuccess: () => void;
  categories: Category[];
}

export const CategoryFormModal = ({
  onSuccess,
  categories,
}: CategoryFormModalProps) => {
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const { closeModal } = useModalStore();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      addToast({
        type: 'error',
        title: 'Nama Diperlukan',
        message: 'Nama kategori harus diisi',
      });
      return;
    }

    if (!currentShop) return;

    setIsSubmitting(true);

    try {
      const existing = await db.categories
        .where('shopId')
        .equals(currentShop.id)
        .and((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())
        .first();

      if (existing) {
        addToast({
          type: 'error',
          title: 'Kategori Sudah Ada',
          message: 'Kategori dengan nama tersebut sudah ada',
        });
        setIsSubmitting(false);
        return;
      }

      const newCategoryId = generateId();
      await db.categories.add({
        id: newCategoryId,
        shopId: currentShop.id,
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
        createdAt: now(),
        updatedAt: now(),
      });

      await db.activityLogs.add({
        id: generateId(),
        shopId: currentShop.id,
        entityType: 'PRODUCT',
        entityId: newCategoryId,
        action: 'CREATED',
        description: `Kategori ${newCategoryName} ditambahkan`,
        performedBy: session?.userName || 'System',
        createdAt: now(),
      });

      addToast({
        type: 'success',
        title: 'Kategori Ditambahkan',
        message: `${newCategoryName} berhasil ditambahkan`,
      });

      setNewCategoryName('');
      setNewCategoryDesc('');
      onSuccess();
    } catch (error) {
      console.error('Failed to add category:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menambahkan',
        message: 'Terjadi kesalahan saat menambahkan kategori',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDesc(category.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDesc('');
  };

  const handleUpdateCategory = async (categoryId: string) => {
    if (!editName.trim()) {
      addToast({
        type: 'error',
        title: 'Nama Diperlukan',
        message: 'Nama kategori harus diisi',
      });
      return;
    }

    if (!currentShop) return;

    try {
      await db.categories.update(categoryId, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
        updatedAt: now(),
      });

      await db.activityLogs.add({
        id: generateId(),
        shopId: currentShop.id,
        entityType: 'PRODUCT',
        entityId: categoryId,
        action: 'UPDATED',
        description: `Kategori ${editName} diupdate`,
        performedBy: session?.userName || 'System',
        createdAt: now(),
      });

      addToast({
        type: 'success',
        title: 'Kategori Diupdate',
        message: `${editName} berhasil diupdate`,
      });

      cancelEdit();
      onSuccess();
    } catch (error) {
      console.error('Failed to update category:', error);
      addToast({
        type: 'error',
        title: 'Gagal Mengupdate',
        message: 'Terjadi kesalahan saat mengupdate kategori',
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`Hapus kategori ${category.name}? Produk dalam kategori ini tidak akan terhapus.`)) {
      return;
    }

    if (!currentShop) return;

    try {
      const productCount = await db.products
        .where('categoryId')
        .equals(category.id)
        .count();

      if (productCount > 0) {
        const confirmMove = confirm(
          `Kategori ini memiliki ${productCount} produk. Produk akan dipindahkan ke "Tanpa Kategori". Lanjutkan?`
        );

        if (!confirmMove) return;

        const productsInCategory = await db.products
          .where('categoryId')
          .equals(category.id)
          .toArray();

        for (const product of productsInCategory) {
          await db.products.update(product.id, {
            categoryId: undefined,
            updatedAt: now(),
          });
        }
      }

      await db.categories.delete(category.id);

      await db.activityLogs.add({
        id: generateId(),
        shopId: currentShop.id,
        entityType: 'PRODUCT',
        entityId: category.id,
        action: 'DELETED',
        description: `Kategori ${category.name} dihapus`,
        performedBy: session?.userName || 'System',
        createdAt: now(),
      });

      addToast({
        type: 'success',
        title: 'Kategori Dihapus',
        message: `${category.name} berhasil dihapus`,
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to delete category:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Terjadi kesalahan saat menghapus kategori',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Kategori</h2>
        <p className="text-sm text-gray-600 mt-1">
          Organisir produk Anda dengan kategori
        </p>
      </div>

      <div className="p-6 space-y-6">
        <form onSubmit={handleAddCategory} className="bg-blue-50 rounded-lg p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Tambah Kategori Baru</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kategori <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Makanan, Minuman, Elektronik"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi
            </label>
            <input
              type="text"
              value={newCategoryDesc}
              onChange={(e) => setNewCategoryDesc(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Deskripsi kategori (opsional)"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            + Tambah Kategori
          </button>
        </form>

        <div>
          <h3 className="font-semibold text-gray-900 mb-4">
            Daftar Kategori ({categories.length})
          </h3>
          
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
              Belum ada kategori. Tambahkan kategori pertama Anda!
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  {editingId === category.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nama kategori"
                      />
                      <input
                        type="text"
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Deskripsi (opsional)"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateCategory(category.id)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg">
                          {category.name}
                        </h4>
                        {category.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {category.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          Dibuat: {new Date(category.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEdit(category)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModal}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
