export const Reports = () => {
  const upcomingFeatures = [
    'Analytics omzet dan profit',
    'Grafik tren penjualan',
    'Produk terlaris secara detail',
    'Customer dengan order terbanyak',
    'Filter laporan berdasarkan rentang tanggal',
    'Export laporan ke Excel/CSV',
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Laporan</h1>
        <p className="text-gray-600 mt-1">Pantau performa toko Anda secara menyeluruh.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Halaman ini sedang dalam pengembangan
        </h2>
        <p className="text-gray-600 mb-6">
          Fitur lengkap akan ditambahkan dalam versi berikutnya.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 text-left max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yang akan tersedia:</h3>
          <ul className="space-y-2 text-gray-600">
            {upcomingFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
