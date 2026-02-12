import { useEffect, useState } from 'react';
import { db, type MessageTemplate, generateId, now } from '../lib/db';
import { useAppStore, useToastStore, useModalStore } from '../lib/store';
import { TemplateFormModal } from '../components/templates/TemplateFormModal';
import { TemplatePreviewModal } from '../components/templates/TemplatePreviewModal';

type FilterLanguage = 'ALL' | 'ID' | 'EN';
type FilterCategory = 'ALL' | MessageTemplate['category'];

const getCategoryLabel = (category: MessageTemplate['category']): string => {
  const labels = {
    ORDER_CONFIRM: '📋 Konfirmasi Pesanan',
    SHIPPING: '📦 Pengiriman',
    FOLLOW_UP: '📞 Follow Up',
    AUTO_REPLY: '🤖 Auto Reply',
    CUSTOM: '✨ Custom',
  };
  return labels[category] || category;
};

const extractVariables = (template: string): string[] => {
  const regex = /\{([^}]+)\}/g;
  const matches = template.match(regex) || [];
  return Array.from(new Set(matches));
};

export const TemplateChat = () => {
  const { currentShop } = useAppStore();
  const { addToast } = useToastStore();
  const { openModal } = useModalStore();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [filterLanguage, setFilterLanguage] = useState<FilterLanguage>('ALL');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = async () => {
    if (!currentShop) return;

    setIsLoading(true);
    try {
      const allTemplates = await db.messageTemplates
        .where('shopId')
        .equals(currentShop.id)
        .toArray();

      allTemplates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTemplates(allTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
      addToast({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Terjadi kesalahan saat memuat template pesan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentShop) {
      loadTemplates();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShop]);

  const handleAddTemplate = () => {
    openModal(<TemplateFormModal onSuccess={loadTemplates} />);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    openModal(<TemplateFormModal template={template} onSuccess={loadTemplates} />);
  };

  const handleDuplicateTemplate = async (template: MessageTemplate) => {
    if (!currentShop) return;

    try {
      const newTemplate: MessageTemplate = {
        ...template,
        id: generateId(),
        name: `${template.name} (Salinan)`,
        createdAt: now(),
        updatedAt: now(),
      };

      await db.messageTemplates.add(newTemplate);

      addToast({
        type: 'success',
        title: 'Template Diduplikasi',
        message: `Template "${template.name}" berhasil diduplikasi`,
      });

      loadTemplates();
    } catch (error) {
      console.error('Failed to duplicate template:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menduplikasi',
        message: 'Terjadi kesalahan saat menduplikasi template',
      });
    }
  };

  const handleDeleteTemplate = async (template: MessageTemplate) => {
    if (!confirm(`Hapus template "${template.name}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      await db.messageTemplates.delete(template.id);

      addToast({
        type: 'success',
        title: 'Template Dihapus',
        message: `Template "${template.name}" berhasil dihapus`,
      });

      loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Terjadi kesalahan saat menghapus template',
      });
    }
  };

  const handlePreviewTemplate = (template: MessageTemplate) => {
    openModal(<TemplatePreviewModal template={template} />);
  };

  const handleCopyContent = (template: MessageTemplate) => {
    navigator.clipboard.writeText(template.template);
    addToast({
      type: 'success',
      title: 'Disalin',
      message: 'Konten template berhasil disalin ke clipboard',
    });
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesLanguage = filterLanguage === 'ALL' || template.language === filterLanguage;
    const matchesCategory = filterCategory === 'ALL' || template.category === filterCategory;
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.template.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLanguage && matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Chat</h1>
            <p className="text-gray-600 mt-1">
              Kelola template pesan WhatsApp untuk berbagai keperluan
            </p>
          </div>
          <button
            onClick={handleAddTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            <span>Tambah Template</span>
          </button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="ORDER_CONFIRM">Konfirmasi Pesanan</option>
            <option value="SHIPPING">Pengiriman</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="AUTO_REPLY">Auto Reply</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <select
            value={filterLanguage}
            onChange={(e) => setFilterLanguage(e.target.value as FilterLanguage)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">Semua Bahasa</option>
            <option value="ID">🇮🇩 Indonesia</option>
            <option value="EN">🇬🇧 English</option>
          </select>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery || filterLanguage !== 'ALL' ? 'Tidak Ada Template' : 'Belum Ada Template'}
          </h2>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterLanguage !== 'ALL'
              ? 'Tidak ada template yang sesuai dengan filter Anda'
              : 'Mulai dengan membuat template pesan WhatsApp pertama Anda'}
          </p>
          {!searchQuery && filterLanguage === 'ALL' && (
            <button
              onClick={handleAddTemplate}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buat Template Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {template.language === 'ID' ? '🇮🇩 ID' : '🇬🇧 EN'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {getCategoryLabel(template.category)}
                  </p>
                </div>
              </div>

              <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {template.template.length > 150
                    ? template.template.substring(0, 150) + '...'
                    : template.template}
                </pre>
              </div>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Variabel:</p>
                <div className="flex flex-wrap gap-1">
                  {extractVariables(template.template).map((variable) => (
                    <span
                      key={variable}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 font-mono"
                    >
                      {variable}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  title="Preview"
                >
                  👁️ Preview
                </button>
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="flex-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors"
                  title="Edit"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleCopyContent(template)}
                  className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                  title="Salin konten"
                >
                  📋
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(template)}
                  className="px-3 py-2 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                  title="Duplikasi"
                >
                  📑
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTemplates.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Menampilkan {filteredTemplates.length} dari {templates.length} template
        </div>
      )}
    </div>
  );
};
