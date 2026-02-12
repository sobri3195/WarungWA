import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import {
  db,
  type Order,
  type OrderItem,
  type OrderStatusHistory,
  type Payment,
  type Customer,
  type MessageTemplate,
  type Shop,
} from '../lib/db';
import { useAppStore, useToastStore } from '../lib/store';
import { formatCurrency, openOrderWhatsApp } from '../lib/whatsapp';
import { InvoiceDocument, getInvoiceFilename } from '../lib/pdf-invoice';

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentShop, session } = useAppStore();
  const { addToast } = useToastStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [statusHistory, setStatusHistory] = useState<OrderStatusHistory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (id && currentShop) {
      loadOrderDetail();
    }
  }, [id, currentShop]);

  const loadOrderDetail = async () => {
    if (!id || !currentShop) return;

    try {
      // Load order
      const orderData = await db.orders.get(id);
      if (!orderData) {
        addToast({
          type: 'error',
          title: 'Pesanan Tidak Ditemukan',
        });
        navigate('/pesanan');
        return;
      }

      setOrder(orderData);

      // Load order items
      const items = await db.orderItems.where('orderId').equals(id).toArray();
      setOrderItems(items);

      // Load status history
      const history = await db.orderStatusHistory
        .where('orderId')
        .equals(id)
        .toArray();
      history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setStatusHistory(history);

      // Load payments
      const paymentData = await db.payments.where('orderId').equals(id).toArray();
      paymentData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPayments(paymentData);

      // Load customer
      const customerData = await db.customers.get(orderData.customerId);
      setCustomer(customerData || null);

      // Load message templates
      const templateData = await db.messageTemplates
        .where('shopId')
        .equals(currentShop.id)
        .toArray();
      setTemplates(templateData);
    } catch (error) {
      console.error('Failed to load order detail:', error);
      addToast({
        type: 'error',
        title: 'Gagal Memuat Data',
      });
    }
  };

  const handleSendWhatsApp = () => {
    if (!order || !currentShop || !selectedTemplate) {
      addToast({
        type: 'warning',
        title: 'Pilih Template',
        message: 'Silakan pilih template pesan terlebih dahulu',
      });
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    openOrderWhatsApp(order, template, customer || undefined);

    addToast({
      type: 'success',
      title: 'WhatsApp Terbuka',
      message: 'Pesan sudah disiapkan, silakan kirim dari WhatsApp',
    });
  };

  const handleDownloadInvoice = async () => {
    if (!order || !currentShop) return;

    try {
      const blob = await pdf(
        <InvoiceDocument
          order={order}
          orderItems={orderItems}
          shop={currentShop}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getInvoiceFilename(order.orderNumber);
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        type: 'success',
        title: 'Invoice Diunduh',
      });
    } catch (error) {
      console.error('Failed to download invoice:', error);
      addToast({
        type: 'error',
        title: 'Gagal Unduh Invoice',
      });
    }
  };

  if (!order) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/pesanan')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Kembali
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pesanan #{order.orderNumber}
            </h1>
            <p className="text-gray-600 mt-1">
              Dibuat {new Date(order.createdAt).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadInvoice}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            📄 Download Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Detail Pesanan</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Item</th>
                    <th className="text-center py-2">Qty</th>
                    <th className="text-right py-2">Harga</th>
                    <th className="text-right py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium">{item.productName}</p>
                        {item.variantName && (
                          <p className="text-sm text-gray-600">{item.variantName}</p>
                        )}
                      </td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                      <td className="text-right font-semibold">
                        {formatCurrency(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ongkir:</span>
                    <span className="font-semibold">
                      {formatCurrency(order.shippingCost)}
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diskon:</span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg border-t pt-2">
                  <span className="font-bold">TOTAL:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Informasi Pelanggan</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">WhatsApp</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
              {order.shippingAddress && (
                <div>
                  <p className="text-sm text-gray-600">Alamat Pengiriman</p>
                  <p className="font-medium">{order.shippingAddress}</p>
                </div>
              )}
              {customer && (
                <div>
                  <p className="text-sm text-gray-600">Level Pelanggan</p>
                  <p className="font-medium">{customer.level}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Riwayat Status</h2>
            <div className="space-y-3">
              {statusHistory.map((history) => (
                <div
                  key={history.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded"
                >
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{history.status}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(history.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">Oleh: {history.changedBy}</p>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Riwayat Pembayaran</h2>
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {payment.method} • {new Date(payment.createdAt).toLocaleString('id-ID')}
                      </p>
                      {payment.notes && (
                        <p className="text-sm text-gray-600 mt-1">{payment.notes}</p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Oleh: {payment.createdBy}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">Status Pesanan</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <StatusBadge status={order.status} />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Pembayaran</p>
                <PaymentBadge status={order.paymentStatus} />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Prioritas</p>
                {order.priority === 'URGENT' ? (
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                    URGENT
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">Normal</span>
                )}
              </div>
              {order.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Metode Pembayaran</p>
                  <p className="font-medium">{order.paymentMethod}</p>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-3">📱 Kirim via WhatsApp</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Pilih Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Pilih Template --</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.language})
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSendWhatsApp}
                disabled={!selectedTemplate}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kirim WhatsApp
              </button>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3">Catatan</h3>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    BARU: 'bg-blue-100 text-blue-800',
    KONFIRMASI: 'bg-yellow-100 text-yellow-800',
    DIKEMAS: 'bg-purple-100 text-purple-800',
    DIKIRIM: 'bg-indigo-100 text-indigo-800',
    SELESAI: 'bg-green-100 text-green-800',
    DIBATALKAN: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-medium ${colors[status]}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    BELUM_BAYAR: 'bg-red-100 text-red-800',
    DP: 'bg-yellow-100 text-yellow-800',
    LUNAS: 'bg-green-100 text-green-800',
  };

  const labels: Record<string, string> = {
    BELUM_BAYAR: 'Belum Bayar',
    DP: 'DP',
    LUNAS: 'Lunas',
  };

  return (
    <span className={`px-3 py-1 rounded text-sm font-medium ${colors[status]}`}>
      {labels[status]}
    </span>
  );
};
