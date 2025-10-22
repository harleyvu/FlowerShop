import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as orderApi from '../../api/orderModel';

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any | null>(null);

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
          <Text style={{ fontWeight: '700' }}>Status: {order.status}</Text>
          <Text>Created: {new Date(order.createdAt).toLocaleString()}</Text>
          <Text style={{ marginTop: 8 }}>Recipient: {order.senderName ?? order.customerName ?? 'N/A'}</Text>
          <Text>Delivery: {order.deliveryAddress ?? 'N/A'}</Text>
          <Text style={{ marginTop: 8, fontWeight: '700' }}>Items ({items.length})</Text>

          <FlatList
            data={items}
            keyExtractor={(it, idx) => String(it.flowerId ?? it.productId ?? idx)}
            style={{ marginTop: 8 }}
            renderItem={({ item }) => {
              // support different possible shapes: { flowerId, unitPrice, quantity } or { productId, price, quantity }
              const idKey = item.flowerId ?? item.productId ?? item.id ?? 'n/a';
              const name = item.name ?? item.productName ?? `Item ${idKey}`;
              const qty = item.quantity ?? item.qty ?? 1;
              const price = item.unitPrice ?? item.price ?? item.pricePerUnit ?? 0;
              const image = item.imageUrl ?? item.image;

              return (
                <View style={styles.itemRow}>
                  {image ? (
                    <Image source={{ uri: image }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumb, styles.placeholder]}><Text style={{ color: '#666' }}>No Image</Text></View>
                  )}
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ fontWeight: '700' }}>{name}</Text>
                    <Text>Qty: {qty}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontWeight: '700' }}>{Number(price).toLocaleString()} đ</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{(Number(price) * Number(qty)).toLocaleString()} đ</Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={<Text>Không có sản phẩm</Text>}
          />

          <View style={{ marginTop: 12, borderTopWidth: 1, borderColor: '#f0f0f0', paddingTop: 12 }}>
            <Text style={{ fontWeight: '700' }}>Total: {order.total ?? order.amount ?? 0} đ</Text>
            {order.note ? <Text style={{ marginTop: 6 }}>Note: {order.note}</Text> : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  backBtn: { padding: 6 },
  title: { fontWeight: '800' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#f0f0f0' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f7f7f7' },
  thumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: '#f0f4f2' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
