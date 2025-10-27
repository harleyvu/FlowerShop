import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
        setError(err?.message || 'Lỗi khi tải order');
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
        // open in browser
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

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;
  if (error) return <View style={styles.center}><Text style={{ color: 'crimson' }}>{error}</Text></View>;
  if (!order) return <View style={styles.center}><Text>Không tìm thấy đơn hàng</Text></View>;

  const items = order.items ?? [];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#27c16b' }}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order #{order.id}</Text>
        <View style={{ width: 56 }} />
      </View>

      <ScrollView style={{ padding: 12 }}>
        <View style={styles.card}>
          {/* 🌸 Order Info */}
          <Text style={{ fontWeight: '700' }}>
            Status: {mapOrderStatus(order.status)}
          </Text>
          <Text>Created: {new Date(order.createdAt).toLocaleString()}</Text>
          {order.confirmedAt && (
            <Text>Confirmed: {new Date(order.confirmedAt).toLocaleString()}</Text>
          )}
          <Text style={{ marginTop: 8 }}>Sender: {order.senderName}</Text>
          <Text>Email: {order.senderEmail}</Text>
          <Text>Phone: {order.senderPhone}</Text>
          <Text>Recipient: {order.recipient}</Text>
          <Text>
            Delivery Date:{' '}
            {new Date(order.deliveryDate).toLocaleDateString()}
          </Text>
          <Text>
            Time Window: {mapDeliveryTime(order.deliveryTimeWindow)}
          </Text>

          {/* 🌼 Items */}
          <Text style={{ marginTop: 12, fontWeight: '700' }}>
            Items ({items.length})
          </Text>
          <FlatList
            data={items}
            keyExtractor={(it, idx) => String(it.flowerId ?? it.id ?? idx)}
            style={{ marginTop: 8 }}
            renderItem={({ item }) => {
              const price = item.unitPrice ?? 0;
              const qty = item.quantity ?? 1;
              return (
                <View style={styles.itemRow}>
                  <View style={[styles.thumb, styles.placeholder]}>
                    <Text style={{ color: '#666' }}>🌺</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ fontWeight: '700' }}>{item.flowerName}</Text>
                    <Text>Qty: {qty}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: '700' }}>
                      {(price * qty).toLocaleString()} đ
                    </Text>
                  </View>
                </View>
              );
            }}
          />

          {/* 💰 Payment */}
          {order.payment && (
            <>
              <Text style={styles.sectionTitle}>Payment:</Text>
              <Text>Method: {mapPaymentMethod(order.payment.method)}</Text>
              <Text>Amount: {order.payment.amount} đ</Text>
              <Text>Status: {mapPaymentStatus(order.payment.status)}</Text>

              {/* Pay button for unpaid orders */}
              {(order.payment.status === 0 || order.payment.status == null) && (
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={handleSendPayment}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.payText}>Pay (Momo)</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}

          {/* 🚚 Delivery */}
          {order.delivery && (
            <>
              <Text style={styles.sectionTitle}>Delivery:</Text>
              <Text>Status: {mapDeliveryStatus(order.delivery.status)}</Text>
              {order.delivery.deliveredAt && (
                <Text>
                  Delivered:{' '}
                  {new Date(order.delivery.deliveredAt).toLocaleString()}
                </Text>
              )}
              {order.delivery.proofPhotoUrl && (
                <Image
                  source={{ uri: order.delivery.proofPhotoUrl }}
                  style={{
                    width: '100%',
                    height: 160,
                    borderRadius: 8,
                    marginTop: 8,
                  }}
                  resizeMode="cover"
                />
              )}
            </>
          )}

          <View
            style={{
              marginTop: 12,
              borderTopWidth: 1,
              borderColor: '#f0f0f0',
              paddingTop: 12,
            }}
          >
            <Text style={{ fontWeight: '700' }}>
              Total: {order.total?.toLocaleString() ?? 0} đ
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    case 1: return 'Morning';
    case 2: return 'Afternoon';
    case 3: return 'Evening';
    default: return 'Unknown';
  }
}

/* ========================= STYLES ========================= */
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  backBtn: { padding: 6 },
  title: { fontWeight: '800' },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f7f7f7',
  },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#f0f4f2' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  sectionTitle: {
    marginTop: 12,
    fontWeight: '700',
    color: '#27c16b',
  },
  payBtn: {
    marginTop: 12,
    backgroundColor: '#a50064',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payText: { color: '#fff', fontWeight: '700' },
});
