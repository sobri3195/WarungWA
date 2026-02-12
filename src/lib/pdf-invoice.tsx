import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { Order, OrderItem, Shop } from './db';
import { formatCurrency } from './whatsapp';

// ============================================================
// PDF STYLES
// ============================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000',
    paddingBottom: 10,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  shopInfo: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #000',
    paddingBottom: 5,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottom: '1 solid #eee',
  },
  colNo: {
    width: '8%',
  },
  colItem: {
    width: '42%',
  },
  colQty: {
    width: '15%',
    textAlign: 'right',
  },
  colPrice: {
    width: '17.5%',
    textAlign: 'right',
  },
  colTotal: {
    width: '17.5%',
    textAlign: 'right',
  },
  summary: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  summaryRow: {
    flexDirection: 'row',
    width: '50%',
    marginBottom: 5,
  },
  summaryLabel: {
    width: '60%',
    textAlign: 'right',
    paddingRight: 10,
  },
  summaryValue: {
    width: '40%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    width: '50%',
    marginTop: 5,
    paddingTop: 5,
    borderTop: '2 solid #000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #eee',
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  notes: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    fontSize: 9,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

// ============================================================
// INVOICE DOCUMENT
// ============================================================

interface InvoiceDocumentProps {
  order: Order;
  orderItems: OrderItem[];
  shop: Shop;
}

export const InvoiceDocument = ({ order, orderItems, shop }: InvoiceDocumentProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Shop Info */}
        <View style={styles.header}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopInfo}>{shop.address}</Text>
          <Text style={styles.shopInfo}>WhatsApp: {shop.phone}</Text>
        </View>

        {/* Invoice Title */}
        <Text style={styles.title}>INVOICE</Text>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Nomor Invoice:</Text>
            <Text style={styles.value}>{order.orderNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tanggal:</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{order.status}</Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Pelanggan</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nama:</Text>
            <Text style={styles.value}>{order.customerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>WhatsApp:</Text>
            <Text style={styles.value}>{order.customerPhone}</Text>
          </View>
          {order.shippingAddress && (
            <View style={styles.row}>
              <Text style={styles.label}>Alamat:</Text>
              <Text style={styles.value}>{order.shippingAddress}</Text>
            </View>
          )}
        </View>

        {/* Order Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colNo}>No</Text>
            <Text style={styles.colItem}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Harga</Text>
            <Text style={styles.colTotal}>Subtotal</Text>
          </View>
          
          {orderItems.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={styles.colNo}>{index + 1}</Text>
              <Text style={styles.colItem}>
                {item.productName}
                {item.variantName && ` (${item.variantName})`}
              </Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          
          {order.shippingCost > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ongkir:</Text>
              <Text style={styles.summaryValue}>{formatCurrency(order.shippingCost)}</Text>
            </View>
          )}
          
          {order.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Diskon:</Text>
              <Text style={styles.summaryValue}>-{formatCurrency(order.discount)}</Text>
            </View>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.summaryLabel}>TOTAL:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(order.total)}</Text>
          </View>
        </View>

        {/* Payment Status */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Status Pembayaran:</Text>
            <Text style={styles.value}>
              {order.paymentStatus === 'LUNAS' ? '✓ LUNAS' : 
               order.paymentStatus === 'DP' ? 'DP (Belum Lunas)' : 
               'Belum Dibayar'}
            </Text>
          </View>
          {order.paymentMethod && (
            <View style={styles.row}>
              <Text style={styles.label}>Metode Pembayaran:</Text>
              <Text style={styles.value}>{order.paymentMethod}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Catatan:</Text>
            <Text>{order.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Terima kasih atas kepercayaan Anda!</Text>
          <Text>Invoice ini dibuat otomatis oleh sistem WarungWA</Text>
        </View>
      </Page>
    </Document>
  );
};

// ============================================================
// EXPORT HELPERS
// ============================================================

/**
 * Generate filename for invoice
 */
export const getInvoiceFilename = (orderNumber: string): string => {
  return `Invoice-${orderNumber}.pdf`;
};
