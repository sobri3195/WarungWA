import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageConfig: Record<string, { title: string; description: string }> = {
  '/login': {
    title: 'Masuk WarungWA - Dashboard Toko WhatsApp',
    description: 'Masuk ke WarungWA untuk mengelola pesanan, pelanggan, produk, dan template WhatsApp.',
  },
  '/dashboard': {
    title: 'Dashboard Penjualan - WarungWA',
    description: 'Pantau omzet, pesanan terbaru, reminder, dan produk terlaris dari satu dashboard WarungWA.',
  },
  '/pesanan': {
    title: 'Kelola Pesanan - WarungWA',
    description: 'Lacak status order dari BARU hingga SELESAI, update pembayaran, dan follow up pelanggan.',
  },
  '/pelanggan': {
    title: 'Data Pelanggan - WarungWA',
    description: 'Kelola database pelanggan, histori pembelian, dan segmentasi customer untuk promosi.',
  },
  '/produk': {
    title: 'Manajemen Produk - WarungWA',
    description: 'Atur katalog produk, kategori, harga, dan ketersediaan stok untuk toko Anda.',
  },
  '/laporan': {
    title: 'Laporan Penjualan - WarungWA',
    description: 'Analisis performa penjualan dan tren omzet bisnis Anda dengan laporan WarungWA.',
  },
  '/template-chat': {
    title: 'Template Chat WhatsApp - WarungWA',
    description: 'Buat dan kelola template chat WhatsApp untuk mempercepat follow up dan closing.',
  },
  '/pengaturan': {
    title: 'Pengaturan Aplikasi - WarungWA',
    description: 'Konfigurasi profil toko, preferensi aplikasi, dan pengaturan operasional tim.',
  },
};

export function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const config =
      pageConfig[location.pathname] ||
      Object.entries(pageConfig).find(([path]) => location.pathname.startsWith(`${path}/`))?.[1] || {
        title: 'WarungWA - Kelola Toko Online via WhatsApp',
        description:
          'WarungWA membantu UMKM mengelola katalog, pelanggan, dan pesanan secara cepat melalui WhatsApp.',
      };

    document.title = config.title;

    const setMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('description', config.description);
    setMeta('og:title', config.title, true);
    setMeta('og:description', config.description, true);
    setMeta('twitter:title', config.title);
    setMeta('twitter:description', config.description);
    setMeta('robots', 'index, follow, max-image-preview:large');
  }, [location.pathname]);

  return null;
}
