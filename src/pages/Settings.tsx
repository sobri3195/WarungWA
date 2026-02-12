import { useEffect, useState, useRef } from 'react';
import { db, type Shop, type OperatingHours, type CustomerLevelPricing, type ShippingArea, generateId, now } from '../lib/db';
import { useAppStore, useToastStore } from '../lib/store';
import { exportToJSON, downloadJSON, importFromJSON, exportCustomersToExcel, exportOrdersToExcel, exportProductsToExcel } from '../lib/export';

// ============================================================
// TYPES & CONSTANTS
// ============================================================

type SettingsTab = 'profile' | 'operating-hours' | 'pricing' | 'shipping' | 'data';

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const DEFAULT_HOURS: Omit<OperatingHours, 'id' | 'shopId' | 'createdAt' | 'updatedAt'>[] = [
  { dayOfWeek: 0, openTime: '09:00', closeTime: '21:00', isOpen: false },
  { dayOfWeek: 1, openTime: '09:00', closeTime: '21:00', isOpen: true },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '21:00', isOpen: true },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '21:00', isOpen: true },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '21:00', isOpen: true },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '21:00', isOpen: true },
  { dayOfWeek: 6, openTime: '09:00', closeTime: '21:00', isOpen: true },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export const Settings = () => {
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(true);
  
  // Data states
  const [shop, setShop] = useState<Shop | null>(null);
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([]);
  const [pricing, setPricing] = useState<CustomerLevelPricing[]>([]);
  const [shippingAreas, setShippingAreas] = useState<ShippingArea[]>([]);
  
  // Form states
  const [shopForm, setShopForm] = useState({
    name: '',
    phone: '',
    address: '',
    currency: 'IDR',
    timezone: 'Asia/Jakarta',
    logo: '',
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // DATA LOADING
  // ============================================================

  const loadData = async () => {
    if (!currentShop) return;
    
    setIsLoading(true);
    try {
      // Load shop data
      const shopData = await db.shops.get(currentShop.id);
      if (shopData) {
        setShop(shopData);
        setShopForm({
          name: shopData.name,
          phone: shopData.phone,
          address: shopData.address,
          currency: shopData.currency,
          timezone: shopData.timezone,
          logo: shopData.logo || '',
        });
      }
      
      // Load operating hours
      const hours = await db.operatingHours
        .where('shopId')
        .equals(currentShop.id)
        .toArray();
      
      if (hours.length === 0) {
        // Create default hours
        const defaultHoursData: OperatingHours[] = DEFAULT_HOURS.map((h) => ({
          ...h,
          id: generateId(),
          shopId: currentShop.id,
          createdAt: now(),
          updatedAt: now(),
        }));
        await db.operatingHours.bulkAdd(defaultHoursData);
        setOperatingHours(defaultHoursData);
      } else {
        // Sort by day of week
        hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        setOperatingHours(hours);
      }
      
      // Load pricing
      const pricingData = await db.customerLevelPricing
        .where('shopId')
        .equals(currentShop.id)
        .toArray();
      setPricing(pricingData);
      
      // Load shipping areas
      const areas = await db.shippingAreas
        .where('shopId')
        .equals(currentShop.id)
        .toArray();
      setShippingAreas(areas);
    } catch (error) {
      console.error('Failed to load settings:', error);
      addToast({
        type: 'error',
        title: 'Gagal Memuat Data',
        message: 'Terjadi kesalahan saat memuat pengaturan',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentShop) {
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShop]);

  // ============================================================
  // SHOP PROFILE HANDLERS
  // ============================================================

  const handleShopFormChange = (field: keyof typeof shopForm, value: string) => {
    setShopForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (value: string) => {
    setShopForm((prev) => ({ ...prev, logo: value }));
  };

  const handleSaveShop = async () => {
    if (!currentShop) return;
    
    try {
      const updatedShop: Shop = {
        ...currentShop,
        ...shopForm,
        updatedAt: now(),
      };
      
      await db.shops.put(updatedShop);
      setShop(updatedShop);
      
      addToast({
        type: 'success',
        title: 'Berhasil Disimpan',
        message: 'Profil toko berhasil diperbarui',
      });
    } catch (error) {
      console.error('Failed to save shop:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan profil toko',
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleLogoChange(base64);
    };
    reader.readAsDataURL(file);
  };

  // ============================================================
  // OPERATING HOURS HANDLERS
  // ============================================================

  const handleHourChange = (index: number, field: keyof OperatingHours, value: unknown) => {
    setOperatingHours((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveHours = async () => {
    try {
      await db.operatingHours.bulkPut(
        operatingHours.map((h) => ({ ...h, updatedAt: now() }))
      );
      
      addToast({
        type: 'success',
        title: 'Berhasil Disimpan',
        message: 'Jam operasional berhasil diperbarui',
      });
    } catch (error) {
      console.error('Failed to save hours:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan jam operasional',
      });
    }
  };

  // ============================================================
  // PRICING HANDLERS
  // ============================================================

  const handlePricingChange = (id: string, field: keyof CustomerLevelPricing, value: unknown) => {
    setPricing((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSavePricing = async () => {
    try {
      await db.customerLevelPricing.bulkPut(
        pricing.map((p) => ({ ...p, updatedAt: now() }))
      );
      
      addToast({
        type: 'success',
        title: 'Berhasil Disimpan',
        message: 'Pengaturan harga level berhasil diperbarui',
      });
    } catch (error) {
      console.error('Failed to save pricing:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan pengaturan harga',
      });
    }
  };

  // ============================================================
  // SHIPPING AREA HANDLERS
  // ============================================================

  const handleAddShippingArea = () => {
    if (!currentShop) return;
    
    const newArea: ShippingArea = {
      id: generateId(),
      shopId: currentShop.id,
      name: 'Area Baru',
      cost: 0,
      estimatedDays: '',
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    };
    
    setShippingAreas((prev) => [...prev, newArea]);
  };

  const handleShippingAreaChange = (id: string, field: keyof ShippingArea, value: unknown) => {
    setShippingAreas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleDeleteShippingArea = (id: string) => {
    if (!confirm('Hapus area pengiriman ini?')) return;
    setShippingAreas((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveShippingAreas = async () => {
    try {
      // Delete removed areas
      const existingIds = shippingAreas.map((a) => a.id);
      const allAreas = await db.shippingAreas.where('shopId').equals(currentShop!.id).toArray();
      const toDelete = allAreas.filter((a) => !existingIds.includes(a.id));
      
      if (toDelete.length > 0) {
        await db.shippingAreas.bulkDelete(toDelete.map((a) => a.id));
      }
      
      // Save current areas
      await db.shippingAreas.bulkPut(
        shippingAreas.map((a) => ({ ...a, updatedAt: now() }))
      );
      
      addToast({
        type: 'success',
        title: 'Berhasil Disimpan',
        message: 'Area pengiriman berhasil diperbarui',
      });
    } catch (error) {
      console.error('Failed to save shipping areas:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan area pengiriman',
      });
    }
  };

  // ============================================================
  // DATA MANAGEMENT HANDLERS
  // ============================================================

  const handleExportJSON = async () => {
    try {
      const data = await exportToJSON(currentShop!.id);
      downloadJSON(data, `warungwa-backup-${currentShop!.name}-${Date.now()}.json`);
      addToast({
        type: 'success',
        title: 'Export Berhasil',
        message: 'Data berhasil diexport ke JSON',
      });
    } catch (error) {
      console.error('Export failed:', error);
      addToast({
        type: 'error',
        title: 'Export Gagal',
        message: 'Terjadi kesalahan saat export data',
      });
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      const result = await importFromJSON(backup, { 
        merge: true, 
        shopId: currentShop!.id 
      });
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Import Berhasil',
          message: `${result.message}. Produk: ${result.stats.products}, Pelanggan: ${result.stats.customers}, Pesanan: ${result.stats.orders}`,
        });
        loadData();
      } else {
        addToast({
          type: 'error',
          title: 'Import Gagal',
          message: result.message,
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
      addToast({
        type: 'error',
        title: 'Import Gagal',
        message: 'Terjadi kesalahan saat import data. Pastikan file JSON valid.',
      });
    }
  };

  const handleExportExcel = async (type: 'customers' | 'orders' | 'products') => {
    try {
      switch (type) {
        case 'customers':
          await exportCustomersToExcel(currentShop!.id);
          break;
        case 'orders':
          await exportOrdersToExcel(currentShop!.id);
          break;
        case 'products':
          await exportProductsToExcel(currentShop!.id);
          break;
      }
      addToast({
        type: 'success',
        title: 'Export Berhasil',
        message: `Data ${type} berhasil diexport ke Excel`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      addToast({
        type: 'error',
        title: 'Export Gagal',
        message: 'Terjadi kesalahan saat export data',
      });
    }
  };

  const handleClearData = async () => {
    if (!confirm('PERINGATAN: Ini akan menghapus SEMUA data toko termasuk pesanan, pelanggan, dan produk.\n\nApakah Anda yakin?')) {
      return;
    }
    
    if (!confirm('Konfirmasi terakhir: Data yang dihapus TIDAK dapat dikembalikan. Lanjutkan?')) {
      return;
    }
    
    try {
      // Clear all data for current shop
      const shopId = currentShop!.id;
      
      await db.orders.where('shopId').equals(shopId).delete();
      await db.orderItems.where('orderId').noneOf([]).delete(); // Will be cascade
      await db.customers.where('shopId').equals(shopId).delete();
      await db.products.where('shopId').equals(shopId).delete();
      await db.categories.where('shopId').equals(shopId).delete();
      await db.shippingAreas.where('shopId').equals(shopId).delete();
      await db.messageTemplates.where('shopId').equals(shopId).delete();
      await db.reminders.where('shopId').equals(shopId).delete();
      
      addToast({
        type: 'success',
        title: 'Data Dihapus',
        message: 'Semua data toko telah dihapus',
      });
      
      loadData();
    } catch (error) {
      console.error('Failed to clear data:', error);
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: 'Terjadi kesalahan saat menghapus data',
      });
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat pengaturan...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profil Toko', icon: '🏪' },
    { id: 'operating-hours' as SettingsTab, label: 'Jam Operasional', icon: '⏰' },
    { id: 'pricing' as SettingsTab, label: 'Level Harga', icon: '💰' },
    { id: 'shipping' as SettingsTab, label: 'Area Pengiriman', icon: '🚚' },
    { id: 'data' as SettingsTab, label: 'Kelola Data', icon: '💾' },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-1">
          Kelola profil toko, jam operasional, dan pengaturan lainnya
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center gap-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil Toko</h2>
              
              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Toko
                  </label>
                  <div className="flex items-center gap-4">
                    {shopForm.logo ? (
                      <div className="relative">
                        <img
                          src={shopForm.logo}
                          alt="Logo preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          onClick={() => handleLogoChange('')}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                        🏪
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors text-sm"
                      >
                        {shopForm.logo ? 'Ganti Logo' : 'Upload Logo'}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Maks 2MB, format JPG/PNG
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Toko
                  </label>
                  <input
                    type="text"
                    value={shopForm.name}
                    onChange={(e) => handleShopFormChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={shopForm.phone}
                    onChange={(e) => handleShopFormChange('phone', e.target.value)}
                    placeholder="6281234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 628xxxxxxxxxx (tanpa + atau spasi)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Toko
                  </label>
                  <textarea
                    value={shopForm.address}
                    onChange={(e) => handleShopFormChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Uang
                    </label>
                    <select
                      value={shopForm.currency}
                      onChange={(e) => handleShopFormChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="IDR">IDR - Rupiah Indonesia</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="MYR">MYR - Malaysian Ringgit</option>
                      <option value="SGD">SGD - Singapore Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zona Waktu
                    </label>
                    <select
                      value={shopForm.timezone}
                      onChange={(e) => handleShopFormChange('timezone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveShop}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Operating Hours Tab */}
          {activeTab === 'operating-hours' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Jam Operasional</h2>
              </div>

              <div className="space-y-3">
                {operatingHours.map((hour, index) => (
                  <div
                    key={hour.id}
                    className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-24 font-medium text-gray-700">
                      {DAY_NAMES[hour.dayOfWeek]}
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hour.isOpen}
                        onChange={(e) =>
                          handleHourChange(index, 'isOpen', e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-600">Buka</span>
                    </label>

                    {hour.isOpen && (
                      <>
                        <input
                          type="time"
                          value={hour.openTime}
                          onChange={(e) =>
                            handleHourChange(index, 'openTime', e.target.value)
                          }
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={hour.closeTime}
                          onChange={(e) =>
                            handleHourChange(index, 'closeTime', e.target.value)
                          }
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </>
                    )}

                    {!hour.isOpen && (
                      <span className="text-red-500 text-sm">Tutup</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-4">
                <button
                  onClick={handleSaveHours}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Jam Operasional
                </button>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === 'pricing' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Level Harga Pelanggan</h2>
              <p className="text-gray-600 mb-6">
                Atur diskon untuk setiap level pelanggan. Diskon diterapkan saat membuat pesanan.
              </p>

              <div className="space-y-4">
                {pricing.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {p.level === 'RETAIL' && '🛒'}
                        {p.level === 'RESELLER' && '🏪'}
                        {p.level === 'GROSIR' && '📦'} {p.level}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {p.level === 'RETAIL' && 'Pelanggan biasa'}
                        {p.level === 'RESELLER' && 'Reseller/Dropshipper'}
                        {p.level === 'GROSIR' && 'Pembelian dalam jumlah besar'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Diskon (%)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={p.discountPercent}
                            onChange={(e) =>
                              handlePricingChange(
                                p.id,
                                'discountPercent',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                      </div>

                      {p.level === 'GROSIR' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Min. Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={p.minQty || ''}
                            onChange={(e) =>
                              handlePricingChange(
                                p.id,
                                'minQty',
                                parseInt(e.target.value) || undefined
                              )
                            }
                            placeholder="Opsional"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSavePricing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Simpan Level Harga
                </button>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Area Pengiriman</h2>
                <button
                  onClick={handleAddShippingArea}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  Tambah Area
                </button>
              </div>

              <div className="space-y-3">
                {shippingAreas.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Belum ada area pengiriman</p>
                    <p className="text-sm text-gray-500">
                      Klik "Tambah Area" untuk menambahkan area pengiriman
                    </p>
                  </div>
                ) : (
                  shippingAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`p-4 bg-gray-50 rounded-lg border ${
                        area.isActive ? 'border-gray-200' : 'border-gray-300 opacity-75'
                      }`}
                    >
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Nama Area
                          </label>
                          <input
                            type="text"
                            value={area.name}
                            onChange={(e) =>
                              handleShippingAreaChange(area.id, 'name', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Ongkir (Rp)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={area.cost}
                            onChange={(e) =>
                              handleShippingAreaChange(
                                area.id,
                                'cost',
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Estimasi
                          </label>
                          <input
                            type="text"
                            value={area.estimatedDays}
                            onChange={(e) =>
                              handleShippingAreaChange(
                                area.id,
                                'estimatedDays',
                                e.target.value
                              )
                            }
                            placeholder="1-2 hari"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Status
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={area.isActive}
                              onChange={(e) =>
                                handleShippingAreaChange(area.id, 'isActive', e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600">
                              {area.isActive ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </label>
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => handleDeleteShippingArea(area.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus area"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {shippingAreas.length > 0 && (
                <div className="pt-4 mt-4">
                  <button
                    onClick={handleSaveShippingAreas}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Simpan Area Pengiriman
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Data Management Tab */}
          {activeTab === 'data' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Kelola Data</h2>

              <div className="space-y-6">
                {/* Export Section */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">📤 Export Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Export data toko untuk backup atau analisis
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleExportJSON}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Export JSON (Full Backup)
                    </button>
                    <button
                      onClick={() => handleExportExcel('customers')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Export Pelanggan (Excel)
                    </button>
                    <button
                      onClick={() => handleExportExcel('orders')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Export Pesanan (Excel)
                    </button>
                    <button
                      onClick={() => handleExportExcel('products')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Export Produk (Excel)
                    </button>
                  </div>
                </div>

                {/* Import Section */}
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-gray-900 mb-2">📥 Import Data</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Import data dari backup JSON. Data yang ada akan ditimpa.
                  </p>

                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportJSON}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Pilih File JSON
                    </button>
                  </div>
                </div>

                {/* Clear Data Section */}
                {session?.currentRole === 'OWNER' && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <h3 className="font-semibold text-gray-900 mb-2">⚠️ Hapus Data</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Hapus semua data toko termasuk pesanan, pelanggan, dan produk. 
                      Tindakan ini tidak dapat dibatalkan!
                    </p>

                    <button
                      onClick={handleClearData}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Hapus Semua Data
                    </button>
                  </div>
                )}

                {/* Storage Info */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">💾 Informasi Penyimpanan</h3>
                  <p className="text-sm text-gray-600">
                    Data disimpan secara lokal di browser menggunakan IndexedDB. 
                    Data tetap ada meskipun browser ditutup, namun akan hilang jika cache browser dihapus.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
