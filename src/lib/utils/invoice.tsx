import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { Order, OrderItem, Shop } from '../../types';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: 2,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shopInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#666',
  },
  value: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    padding: 8,
    fontSize: 10,
  },
  tableCol1: {
    width: '40%',
  },
  tableCol2: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol3: {
    width: '15%',
    textAlign: 'right',
  },
  tableCol4: {
    width: '30%',
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: 2,
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
  },
});

interface InvoiceDocumentProps {
  order: Order;
  orderItems: OrderItem[];
  shop: Shop;
}

export function InvoiceDocument({ order, orderItems, shop }: InvoiceDocumentProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.shopInfo}>{shop.name}</Text>
          {shop.address && <Text style={styles.shopInfo}>{shop.address}</Text>}
          {shop.phone && <Text style={styles.shopInfo}>WhatsApp: {shop.phone}</Text>}
        </View>

        {/* Invoice Info */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Invoice No:</Text>
            <Text style={styles.value}>#{order.id.substring(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal:</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{getStatusLabel(order.status)}</Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kepada:</Text>
          <Text style={styles.value}>{order.customerName}</Text>
          <Text style={styles.shopInfo}>{order.customerPhone}</Text>
          {order.customerAddress && (
            <Text style={styles.shopInfo}>{order.customerAddress}</Text>
          )}
        </View>

        {/* Order Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCol1}>Produk</Text>
            <Text style={styles.tableCol2}>Qty</Text>
            <Text style={styles.tableCol3}>Harga</Text>
            <Text style={styles.tableCol4}>Subtotal</Text>
          </View>

          {orderItems.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={styles.tableCol1}>
                <Text>{item.productName}</Text>
                {item.variantInfo && (
                  <Text style={{ fontSize: 8, color: '#666' }}>
                    {item.variantInfo}
                  </Text>
                )}
              </View>
              <Text style={styles.tableCol2}>{item.quantity}</Text>
              <Text style={styles.tableCol3}>Rp {formatCurrency(item.price)}</Text>
              <Text style={styles.tableCol4}>Rp {formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Subtotal:</Text>
            <Text style={styles.value}>Rp {formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Ongkir:</Text>
            <Text style={styles.value}>Rp {formatCurrency(order.shippingCost)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Diskon:</Text>
            <Text style={styles.value}>- Rp {formatCurrency(order.discount)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>TOTAL:</Text>
            <Text>Rp {formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pembayaran:</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Status Pembayaran:</Text>
            <Text style={styles.value}>
              {order.paymentStatus === 'PAID' && 'Lunas'}
              {order.paymentStatus === 'DOWN_PAYMENT' && 'DP / Cicilan'}
              {order.paymentStatus === 'UNPAID' && 'Belum Bayar'}
            </Text>
          </View>
          {order.paymentMethod && (
            <View style={styles.row}>
              <Text style={styles.label}>Metode:</Text>
              <Text style={styles.value}>{order.paymentMethod}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Catatan:</Text>
            <Text style={styles.shopInfo}>{order.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Terima kasih atas pesanan Anda!</Text>
          <Text style={{ marginTop: 5 }}>
            Invoice ini digenerate otomatis oleh WarungWA
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(
  order: Order,
  orderItems: OrderItem[],
  shop: Shop
): Promise<Blob> {
  const doc = <InvoiceDocument order={order} orderItems={orderItems} shop={shop} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

export function downloadInvoice(blob: Blob, orderId: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${orderId.substring(0, 8)}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: 'Pesanan Baru',
    CONFIRMED: 'Dikonfirmasi',
    PACKED: 'Sedang Dikemas',
    SHIPPED: 'Dalam Pengiriman',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  };
  return labels[status] || status;
}
