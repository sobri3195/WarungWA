import { useState, useEffect } from 'react';
import { db, type MessageTemplate, generateId, now } from '../../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../../lib/store';
import { Modal } from '../Modal';

interface TemplateFormModalProps {
  template?: MessageTemplate;
  onSuccess: () => void;
}

const COMMON_VARIABLES = [
  { value: '{nama}', label: 'Nama Pelanggan', description: 'Nama pelanggan' },
  { value: '{toko}', label: 'Nama Toko', description: 'Nama toko Anda' },
  { value: '{order_id}', label: 'ID Pesanan', description: 'Nomor pesanan' },
  { value: '{total}', label: 'Total', description: 'Total harga pesanan' },
  { value: '{alamat}', label: 'Alamat', description: 'Alamat pengiriman' },
  { value: '{tanggal}', label: 'Tanggal', description: 'Tanggal pesanan' },
  { value: '{items}', label: 'Item Pesanan', description: 'Daftar item pesanan' },
  { value: '{subtotal}', label: 'Subtotal', description: 'Subtotal sebelum ongkir dan diskon' },
  { value: '{ongkir}', label: 'Ongkir', description: 'Biaya pengiriman' },
  { value: '{diskon}', label: 'Diskon', description: 'Total diskon' },
];

export const TemplateFormModal = ({ template, onSuccess }: TemplateFormModalProps) => {
  const { currentShop } = useAppStore();
  const { addToast } = useToastStore();
  const { closeModal } = useModalStore();

  const [formData, setFormData] = useState({
    name: template?.name || '',
    language: template?.language || ('ID' as 'ID' | 'EN'),
    category: template?.category || ('CUSTOM' as MessageTemplate['category']),
    template: template?.template || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  useEffect(() => {
    const variables = detectVariables(formData.template);
    setDetectedVariables(variables);
  }, [formData.template]);

  const detectVariables = (content: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const matches = content.match(regex) || [];
    return Array.from(new Set(matches));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentShop) return;

    if (!formData.name.trim()) {
      addToast({
        type: 'warning',
        title: 'Nama Template Wajib',
        message: 'Silakan masukkan nama template',
      });
      return;
    }

    if (!formData.template.trim()) {
      addToast({
        type: 'warning',
        title: 'Konten Template Wajib',
        message: 'Silakan masukkan konten template',
      });
      return;
    }

    setIsSaving(true);

    try {
      const templateData: MessageTemplate = {
        id: template?.id || generateId(),
        shopId: currentShop.id,
        name: formData.name.trim(),
        language: formData.language,
        category: formData.category,
        template: formData.template.trim(),
        createdAt: template?.createdAt || now(),
        updatedAt: now(),
      };

      if (template) {
        await db.messageTemplates.put(templateData);
        addToast({
          type: 'success',
          title: 'Template Diperbarui',
          message: `Template "${formData.name}" berhasil diperbarui`,
        });
      } else {
        await db.messageTemplates.add(templateData);
        addToast({
          type: 'success',
          title: 'Template Ditambahkan',
          message: `Template "${formData.name}" berhasil ditambahkan`,
        });
      }

      closeModal();
      onSuccess();
    } catch (error) {
      console.error('Failed to save template:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan template',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.template;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newContent = before + variable + after;
    setFormData({ ...formData, template: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  return (
    <Modal
      title={template ? 'Edit Template' : 'Tambah Template'}
      onClose={closeModal}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Template <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Konfirmasi Pesanan"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as MessageTemplate['category'] })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ORDER_CONFIRM">📋 Konfirmasi Pesanan</option>
              <option value="SHIPPING">📦 Pengiriman</option>
              <option value="FOLLOW_UP">📞 Follow Up</option>
              <option value="AUTO_REPLY">🤖 Auto Reply</option>
              <option value="CUSTOM">✨ Custom</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bahasa
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value as 'ID' | 'EN' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ID">🇮🇩 Indonesia</option>
            <option value="EN">🇬🇧 English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Konten Template <span className="text-red-500">*</span>
          </label>
          <textarea
            id="template-content"
            value={formData.template}
            onChange={(e) => setFormData({ ...formData, template: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            placeholder="Tulis konten template di sini... Gunakan {variabel} untuk data dinamis"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan format <code className="bg-gray-100 px-1 py-0.5 rounded">{'{'}</code>
            <code className="bg-gray-100 px-1 py-0.5 rounded">variabel</code>
            <code className="bg-gray-100 px-1 py-0.5 rounded">{'}'}</code> untuk data dinamis
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variabel yang Tersedia
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
            {COMMON_VARIABLES.map((variable) => (
              <button
                key={variable.value}
                type="button"
                onClick={() => insertVariable(variable.value)}
                className="text-left px-3 py-2 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                title={variable.description}
              >
                <div className="font-mono text-blue-600">{variable.value}</div>
                <div className="text-xs text-gray-500">{variable.label}</div>
              </button>
            ))}
          </div>
        </div>

        {detectedVariables.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Variabel Terdeteksi
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {detectedVariables.map((variable) => (
                <span
                  key={variable}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded border border-blue-300 text-sm font-mono"
                >
                  {variable}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSaving}
          >
            Batal
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : template ? 'Perbarui Template' : 'Simpan Template'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
