import { useState } from 'react';
import { type MessageTemplate } from '../../lib/db';
import { replaceTemplateVariables, generateWhatsAppLink, formatCurrency } from '../../lib/whatsapp';
import { useModalStore, useToastStore } from '../../lib/store';
import { Modal } from '../Modal';

interface TemplatePreviewModalProps {
  template: MessageTemplate;
}

export const TemplatePreviewModal = ({ template }: TemplatePreviewModalProps) => {
  const { closeModal } = useModalStore();
  const { addToast } = useToastStore();

  const [sampleData, setSampleData] = useState<Record<string, string>>({
    '{nama}': 'Budi Santoso',
    '{toko}': 'Warung Kita',
    '{order_id}': 'ORD-20240212-001',
    '{total}': formatCurrency(150000),
    '{alamat}': 'Jl. Merdeka No. 123, Jakarta',
    '{tanggal}': new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
    '{items}': '- Nasi Goreng Spesial x2\n- Es Teh Manis x2',
    '{subtotal}': formatCurrency(140000),
    '{ongkir}': formatCurrency(10000),
    '{diskon}': formatCurrency(0),
  });

  const [phoneNumber, setPhoneNumber] = useState('628123456789');

  const extractVariables = (content: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const matches = content.match(regex) || [];
    return Array.from(new Set(matches));
  };

  const getPreviewContent = () => {
    const variables: Record<string, string> = {};
    
    const detectedVariables = extractVariables(template.template);
    detectedVariables.forEach((variable) => {
      const key = variable.replace(/[{}]/g, '');
      variables[key] = sampleData[variable] || variable;
    });

    return replaceTemplateVariables(template.template, variables);
  };

  const handleCopyContent = () => {
    const content = getPreviewContent();
    navigator.clipboard.writeText(content);
    addToast({
      type: 'success',
      title: 'Disalin',
      message: 'Konten preview berhasil disalin ke clipboard',
    });
  };

  const handleOpenWhatsApp = () => {
    if (!phoneNumber.trim()) {
      addToast({
        type: 'warning',
        title: 'Nomor WhatsApp Diperlukan',
        message: 'Silakan masukkan nomor WhatsApp',
      });
      return;
    }

    const content = getPreviewContent();
    const link = generateWhatsAppLink(phoneNumber, content);
    window.open(link, '_blank');

    addToast({
      type: 'success',
      title: 'WhatsApp Terbuka',
      message: 'Pesan preview dibuka di WhatsApp',
    });
  };

  const updateSampleData = (variable: string, value: string) => {
    setSampleData((prev) => ({ ...prev, [variable]: value }));
  };

  const previewContent = getPreviewContent();
  const characterCount = previewContent.length;
  const wordCount = previewContent.trim().split(/\s+/).length;
  const detectedVariables = extractVariables(template.template);

  return (
    <Modal title="Preview Template" onClose={closeModal} size="lg">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Preview Template</h3>
              <p className="text-sm text-blue-700">
                Sesuaikan data sample di bawah untuk melihat bagaimana template akan terlihat dengan data nyata.
              </p>
            </div>
          </div>
        </div>

        {detectedVariables.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Data Sample</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto p-3 bg-gray-50 rounded-lg border border-gray-200">
              {detectedVariables.map((variable) => (
                <div key={variable} className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-600 w-32 flex-shrink-0">
                    {variable}
                  </span>
                  <input
                    type="text"
                    value={sampleData[variable] || ''}
                    onChange={(e) => updateSampleData(variable, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Isi data untuk ${variable}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Hasil Preview</h3>
            <div className="text-xs text-gray-500">
              {characterCount} karakter • {wordCount} kata
            </div>
          </div>
          <div className="bg-white border-2 border-green-300 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <span className="text-lg">💬</span>
              </div>
              <div className="flex-1">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800">
                    {previewContent}
                  </pre>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Kirim ke WhatsApp (Test)</h3>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nomor WhatsApp (contoh: 628123456789)"
            />
            <button
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>📱</span>
              <span>Buka WhatsApp</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Pesan akan dibuka di WhatsApp Web/App dengan nomor yang Anda masukkan
          </p>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleCopyContent}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <span>📋</span>
            <span>Salin Konten</span>
          </button>
          <button
            onClick={closeModal}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};
