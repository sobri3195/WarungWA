import { useState, useEffect } from 'react';
import { db, type Product, type Category, type ProductVariant, generateId, now } from '../../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../../lib/store';

interface ProductFormModalProps {
  product?: Product;
  onSuccess: () => void;
  categories: Category[];
}

export const ProductFormModal = ({
  product,
  onSuccess,
  categories,
}: ProductFormModalProps) => {
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const { closeModal } = useModalStore();
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    basePrice: product?.basePrice || 0,
    description: product?.description || '',
    isActive: product?.isActive ?? true,
  });

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      loadVariants();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const loadVariants = async () => {
    if (!product) return;
    const productVariants = await db.productVariants
      .where('productId')
      .equals(product.id)
      .toArray();
    setVariants(productVariants);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama produk harus diisi';
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = 'Harga harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;
    if (!currentShop) return;

    setIsSubmitting(true);

    try {
      if (product) {
        await db.products.update(product.id, {
          name: formData.name.trim(),
          sku: formData.sku.trim() || undefined,
          categoryId: formData.categoryId || undefined,
          basePrice: Number(formData.basePrice),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
          updatedAt: now(),
        });

        await db.activityLogs.add({
          id: generateId(),
          shopId: currentShop.id,
          entityType: 'PRODUCT',
          entityId: product.id,
          action: 'UPDATED',
          description: `Produk ${formData.name} diupdate`,
          performedBy: session?.userName || 'System',
          createdAt: now(),
        });

        addToast({
          type: 'success',
          title: 'Produk Diupdate',
          message: `${formData.name} berhasil diupdate`,
        });
      } else {
        const newProductId = generateId();
        await db.products.add({
          id: newProductId,
          shopId: currentShop.id,
          name: formData.name.trim(),
          sku: formData.sku.trim() || undefined,
          categoryId: formData.categoryId || undefined,
          basePrice: Number(formData.basePrice),
          description: formData.description.trim() || undefined,
          isActive: formData.isActive,
          createdAt: now(),
          updatedAt: now(),
        });

        await db.activityLogs.add({
          id: generateId(),
          shopId: currentShop.id,
          entityType: 'PRODUCT',
          entityId: newProductId,
          action: 'CREATED',
          description: `Produk ${formData.name} ditambahkan`,
          performedBy: session?.userName || 'System',
          createdAt: now(),
        });

        addToast({
          type: 'success',
          title: 'Produk Ditambahkan',
          message: `${formData.name} berhasil ditambahkan`,
        });
      }

      onSuccess();
      closeModal();
    } catch (error) {
      console.error('Failed to save product:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan data produk',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVariant = () => {
    if (!product) {
      addToast({
        type: 'warning',
        title: 'Simpan Produk Dulu',
        message: 'Simpan produk terlebih dahulu sebelum menambah varian',
      });
      return;
    }
    
    const newVariant: ProductVariant = {
      id: generateId(),
      productId: product.id,
      name: '',
      priceAdjustment: 0,
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    setVariants([...variants, newVariant]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean | undefined) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleDeleteVariant = async (index: number) => {
    const variant = variants[index];
    if (variant.id && !variant.id.includes('temp')) {
      try {
        await db.productVariants.delete(variant.id);
        addToast({
          type: 'success',
          title: 'Varian Dihapus',
          message: 'Varian berhasil dihapus',
        });
      } catch (error) {
        console.error('Failed to delete variant:', error);
        addToast({
          type: 'error',
          title: 'Gagal Menghapus',
          message: 'Terjadi kesalahan saat menghapus varian',
        });
        return;
      }
    }
    const updated = variants.filter((_, i) => i !== index);
    setVariants(updated);
  };

  const handleSaveVariants = async () => {
    if (!product) return;

    try {
      for (const variant of variants) {
        if (!variant.name.trim()) continue;

        if (variant.id.includes('temp') || !(await db.productVariants.get(variant.id))) {
          await db.productVariants.add({
            ...variant,
            id: generateId(),
            name: variant.name.trim(),
            updatedAt: now(),
          });
        } else {
          await db.productVariants.update(variant.id, {
            name: variant.name.trim(),
            priceAdjustment: Number(variant.priceAdjustment),
            stock: variant.stock,
            sku: variant.sku?.trim() || undefined,
            isActive: variant.isActive,
            updatedAt: now(),
          });
        }
      }

      addToast({
        type: 'success',
        title: 'Varian Disimpan',
        message: 'Semua varian berhasil disimpan',
      });

      loadVariants();
    } catch (error) {
      console.error('Failed to save variants:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan varian',
      });
    }
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {product ? 'Edit Produk' : 'Tambah Produk'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Produk <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nama produk"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kode SKU (opsional)"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tanpa Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Dasar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2 text-gray-500">Rp</span>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className={`w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.basePrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                min="0"
              />
            </div>
            {errors.basePrice && (
              <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Deskripsi produk"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Produk Aktif
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            disabled={isSubmitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Menyimpan...' : product ? 'Update' : 'Tambah'}
          </button>
        </div>
      </form>

      {product && (
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Varian Produk</h3>
            <button
              type="button"
              onClick={handleAddVariant}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              + Tambah Varian
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada varian. Tambahkan varian jika produk memiliki pilihan berbeda.
            </div>
          ) : (
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={variant.id || index}
                  className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nama Varian
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Size: Large"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Penyesuaian Harga
                      </label>
                      <input
                        type="number"
                        value={variant.priceAdjustment}
                        onChange={(e) => handleUpdateVariant(index, 'priceAdjustment', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stok
                      </label>
                      <input
                        type="number"
                        value={variant.stock || ''}
                        onChange={(e) => handleUpdateVariant(index, 'stock', e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Opsional"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteVariant(index)}
                    className="mt-6 text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Hapus
                  </button>
                </div>
              ))}
              
              {variants.length > 0 && (
                <button
                  type="button"
                  onClick={handleSaveVariants}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                >
                  💾 Simpan Semua Varian
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
