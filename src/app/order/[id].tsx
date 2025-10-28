import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiClient, restoreAuthToken } from '../../api/apiClient';
import * as orderApi from '../../api/orderModel';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setError(null);
        setLoading(true);
        if (!id) throw new Error('Invalid order id');
        const data = await orderApi.getOrder(String(id));
        if (!mounted) return;
        setOrder(data);
      } catch (err: any) {
        setError(err?.message || 'Error loading order');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  async function handleSendPayment() {
    try {
      setPaymentLoading(true);
      await restoreAuthToken();

      const amount = order.total ?? items.reduce((s: number, it: any) => s + ((it.unitPrice ?? 0) * (it.quantity ?? 1)), 0);

      const payload = {
        fullName: order.senderName || order.sender || 'Customer',
        orderId: String(order.id),
        orderInfo: `Payment for order #${order.id}`,
        amount: amount,
      } as any;

      const resp = await apiClient.post('/api/payment', payload);
      const data = resp?.data;
      if (data?.payUrl) {
        await Linking.openURL(String(data.payUrl));
      } else if (data?.url) {
        await Linking.openURL(String(data.url));
      } else {
        Alert.alert('Payment', 'Payment request created. No redirect URL returned.');
      }
    } catch (err: any) {
      Alert.alert('Payment error', err?.message || 'Unable to create payment.');
    } finally {
      setPaymentLoading(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#27c16b" /></View>;
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>❌ {error}</Text>
      <TouchableOpacity onPress={() => router.back()} style={styles.retryBtn}>
        <Text style={styles.retryText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
  if (!order) return <View style={styles.center}><Text>Order not found</Text></View>;

  const items = order.items ?? [];
  const paymentStatus = order.payment?.status;
  const isPaid = paymentStatus === 2;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status Badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusEmoji}>{getStatusEmoji(order.status)}</Text>
          <View>
            <Text style={styles.orderNumber}>Order #{order.id}</Text>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {mapOrderStatus(order.status)}
            </Text>
          </View>
        </View>

        {/* Customer Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>👤 Sender Information</Text>
          </View>
          <InfoRow label="Full Name" value={order.senderName} />
          <InfoRow label="Email" value={order.senderEmail} />
          <InfoRow label="Phone" value={order.senderPhone} />
          <View style={styles.divider} />
          <InfoRow label="Recipient" value={order.recipient} icon="🎁" />
          <InfoRow 
            label="Delivery Date" 
            value={new Date(order.deliveryDate).toLocaleDateString('en-US')} 
            icon="📅"
          />
          <InfoRow 
            label="Time Window" 
            value={mapDeliveryTime(order.deliveryTimeWindow)} 
            icon="⏰"
          />
        </View>

        {/* Items List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>🌸 Products ({items.length})</Text>
          </View>
          {items.map((item: any, idx: number) => {
            const price = item.unitPrice ?? 0;
            const qty = item.quantity ?? 1;
            return (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemThumb}>
                  <Text style={styles.itemEmoji}>🌺</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.flowerName}</Text>
                  <Text style={styles.itemQty}>Quantity: {qty}</Text>
                  <Text style={styles.itemPrice}>{price.toLocaleString('en-US')} đ/stem</Text>
                </View>
                <Text style={styles.itemTotal}>
                  {(price * qty).toLocaleString('en-US')} đ
                </Text>
              </View>
            );
          })}
        </View>

        {/* Payment Card */}
        {order.payment && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>💳 Payment</Text>
              <View style={[styles.paymentBadge, { 
                backgroundColor: getPaymentStatusBg(paymentStatus) 
              }]}>
                <Text style={styles.paymentBadgeText}>
                  {mapPaymentStatus(paymentStatus)}
                </Text>
              </View>
            </View>
            
            <InfoRow 
              label="Method" 
              value={isPaid ? "Momo" : mapPaymentMethod(order.payment.method)} 
            />
            <InfoRow 
              label="Amount" 
              value={`${order.payment.amount?.toLocaleString('en-US')} đ`} 
            />

            {/* Pay button for unpaid orders */}
            {(paymentStatus === 0 || paymentStatus == null) && (
              <TouchableOpacity
                style={styles.momoBtn}
                onPress={handleSendPayment}
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.momoBtnText}>💳 Pay with Momo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Delivery Card */}
        {order.delivery && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>🚚 Delivery</Text>
              <View style={[styles.deliveryBadge, { 
                backgroundColor: getDeliveryStatusBg(order.delivery.status) 
              }]}>
                <Text style={styles.deliveryBadgeText}>
                  {mapDeliveryStatus(order.delivery.status)}
                </Text>
              </View>
            </View>
            
            {order.delivery.deliveredAt && (
              <InfoRow 
                label="Delivered at" 
                value={new Date(order.delivery.deliveredAt).toLocaleString('en-US')} 
              />
            )}
            
            {order.delivery.proofPhotoUrl && (
              <View style={styles.proofPhotoContainer}>
                <Text style={styles.proofLabel}>Delivery Proof Photo:</Text>
                <Image
                  source={{ uri: order.delivery.proofPhotoUrl }}
                  style={styles.proofPhoto}
                  resizeMode="cover"
                />
              </View>
            )}
          </View>
        )}

        {/* Total Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {order.total?.toLocaleString('en-US') ?? 0} đ
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ========================= INFO ROW COMPONENT ========================= */
function InfoRow({ label, value, icon }: { label: string; value: string; icon?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{icon ? `${icon} ` : ''}{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

/* ========================= HELPER FUNCTIONS ========================= */
function getStatusEmoji(status?: number) {
  switch (status) {
    case 1: return '⏳';
    case 2: return '✅';
    case 3: return '👨‍🍳';
    case 4: return '🚚';
    case 5: return '🎉';
    case 6: return '❌';
    case 7: return '💰';
    default: return '❓';
  }
}

function getStatusColor(status?: number) {
  switch (status) {
    case 1: return '#f59e0b';
    case 2: return '#10b981';
    case 3: return '#6366f1';
    case 4: return '#3b82f6';
    case 5: return '#22c55e';
    case 6: return '#ef4444';
    case 7: return '#8b5cf6';
    default: return '#6b7280';
  }
}

function getPaymentStatusBg(status?: number) {
  switch (status) {
    case 0: return '#fef3c7';
    case 1: return '#dbeafe';
    case 2: return '#d1fae5';
    case 3: return '#fee2e2';
    case 4: return '#e9d5ff';
    case 5: return '#ddd6fe';
    default: return '#f3f4f6';
  }
}

function getDeliveryStatusBg(status?: number) {
  switch (status) {
    case 0: return '#f3f4f6';
    case 1: return '#dbeafe';
    case 2: return '#fef3c7';
    case 3: return '#ddd6fe';
    case 4: return '#d1fae5';
    case 5: return '#fee2e2';
    case 6: return '#fed7aa';
    default: return '#f3f4f6';
  }
}

/* ========================= ENUM MAPPERS ========================= */
function mapOrderStatus(status?: number) {
  switch (status) {
    case 1: return 'Pending';
    case 2: return 'Confirmed';
    case 3: return 'Preparing';
    case 4: return 'Out for Delivery';
    case 5: return 'Delivered';
    case 6: return 'Cancelled';
    case 7: return 'Refunded';
    default: return 'Unknown';
  }
}

function mapPaymentStatus(status?: number) {
  switch (status) {
    case 0: return 'Unpaid';
    case 1: return 'Authorized';
    case 2: return 'Paid';
    case 3: return 'Failed';
    case 4: return 'Refunded';
    case 5: return 'Partially Refunded';
    default: return 'Unknown';
  }
}

function mapPaymentMethod(method?: number) {
  switch (method) {
    case 0: return 'Unknown';
    case 1: return 'Cash on Delivery';
    default: return 'Other';
  }
}

function mapDeliveryStatus(status?: number) {
  switch (status) {
    case 0: return 'Not Started';
    case 1: return 'Assigned';
    case 2: return 'Picked Up';
    case 3: return 'In Transit';
    case 4: return 'Delivered';
    case 5: return 'Failed';
    case 6: return 'Returned';
    default: return 'Unknown';
  }
}

function mapDeliveryTime(tw?: number) {
  switch (tw) {
    case 0: return 'Anytime';
    case 1: return 'Morning (8AM - 12PM)';
    case 2: return 'Afternoon (12PM - 5PM)';
    case 3: return 'Evening (5PM - 9PM)';
    default: return 'Unknown';
  }
}

/* ========================= STYLES ========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#27c16b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    padding: 8,
  },
  backText: {
    color: '#27c16b',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  deliveryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deliveryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  itemThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fef3f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemQty: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    color: '#9ca3af',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#27c16b',
    marginLeft: 8,
  },
  momoBtn: {
    backgroundColor: '#a50064',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  momoBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  proofPhotoContainer: {
    marginTop: 12,
  },
  proofLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  proofPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  totalCard: {
    backgroundColor: '#27c16b',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
});