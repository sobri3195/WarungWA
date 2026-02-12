import { useState } from 'react';
import { db, type Customer, type CustomerTag, type CustomerLevel, generateId, now } from '../../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../../lib/store';

interface CustomerFormModalProps {
  customer?: Customer & { tags?: CustomerTag[] };
  onSuccess: () => void;
  availableTags: CustomerTag[];
}

export const CustomerFormModal = ({
  customer,
  onSuccess,
  availableTags,
}: CustomerFormModalProps) => {
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const { closeModal } = useModalStore();
  
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    level: (customer?.level || 'RETAIL') as CustomerLevel,
    notes: customer?.notes || '',
  });

  const [selectedTags, setSelectedTags] = useState<string[]>(
    customer?.tags?.map((t) => t.id) || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama harus diisi';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor HP harus diisi';
    } else if (!/^(\+?62|0)\d{9,13}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Format nomor HP tidak valid';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
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
      // Normalize phone number
      const normalizedPhone = formData.phone.trim().replace(/^0/, '62');

      // Check if phone already exists (for different customer)
      const existingCustomer = await db.customers
        .where('shopId')
        .equals(currentShop.id)
        .and((c) => c.phone === normalizedPhone && c.id !== customer?.id)
        .first();

      if (existingCustomer) {
        setErrors({ phone: 'Nomor HP sudah terdaftar' });
        setIsSubmitting(false);
        return;
      }

      if (customer) {
        // Update existing customer
        await db.customers.update(customer.id, {
          name: formData.name.trim(),
          phone: normalizedPhone,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          level: formData.level,
          notes: formData.notes.trim() || undefined,
          updatedAt: now(),
        });

        // Update tags
        // Delete old tag joins
        const oldTagJoins = await db.customerTagJoin
          .where('customerId')
          .equals(customer.id)
          .toArray();
        await db.customerTagJoin.bulkDelete(oldTagJoins.map((tj) => tj.id));

        // Add new tag joins
        const newTagJoins = selectedTags.map((tagId) => ({
          id: generateId(),
          customerId: customer.id,
          tagId,
          createdAt: now(),
        }));
        if (newTagJoins.length > 0) {
          await db.customerTagJoin.bulkAdd(newTagJoins);
        }

        // Add activity log
        await db.activityLogs.add({
          id: generateId(),
          shopId: currentShop.id,
          entityType: 'CUSTOMER',
          entityId: customer.id,
          action: 'UPDATED',
          description: `Pelanggan ${formData.name} diupdate`,
          performedBy: session?.userName || 'System',
          createdAt: now(),
        });

        addToast({
          type: 'success',
          title: 'Pelanggan Diupdate',
          message: `${formData.name} berhasil diupdate`,
        });
      } else {
        // Create new customer
        const newCustomerId = generateId();
        await db.customers.add({
          id: newCustomerId,
          shopId: currentShop.id,
          name: formData.name.trim(),
          phone: normalizedPhone,
          email: formData.email.trim() || undefined,
          address: formData.address.trim() || undefined,
          level: formData.level,
          notes: formData.notes.trim() || undefined,
          createdAt: now(),
          updatedAt: now(),
        });

        // Add tag joins
        const newTagJoins = selectedTags.map((tagId) => ({
          id: generateId(),
          customerId: newCustomerId,
          tagId,
          createdAt: now(),
        }));
        if (newTagJoins.length > 0) {
          await db.customerTagJoin.bulkAdd(newTagJoins);
        }

        // Add activity log
        await db.activityLogs.add({
          id: generateId(),
          shopId: currentShop.id,
          entityType: 'CUSTOMER',
          entityId: newCustomerId,
          action: 'CREATED',
          description: `Pelanggan ${formData.name} ditambahkan`,
          performedBy: session?.userName || 'System',
          createdAt: now(),
        });

        addToast({
          type: 'success',
          title: 'Pelanggan Ditambahkan',
          message: `${formData.name} berhasil ditambahkan`,
        });
      }

      onSuccess();
      closeModal();
    } catch (error) {
      console.error('Failed to save customer:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan data pelanggan',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {customer ? 'Edit Pelanggan' : 'Tambah Pelanggan'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nama lengkap pelanggan"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor HP <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="08123456789 atau 628123456789"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="email@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alamat
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Alamat lengkap pelanggan"
          />
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['RETAIL', 'RESELLER', 'GROSIR'] as CustomerLevel[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, level })}
                className={`py-3 px-4 border-2 rounded-lg font-medium transition-colors ${
                  formData.level === level
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    selectedTags.includes(tag.id)
                      ? 'text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={
                    selectedTags.includes(tag.id)
                      ? { backgroundColor: tag.color }
                      : {}
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Catatan tambahan tentang pelanggan"
          />
        </div>

        {/* Actions */}
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
            {isSubmitting ? 'Menyimpan...' : customer ? 'Update' : 'Tambah'}
          </button>
        </div>
      </form>
    </div>
  );
};
