import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  success: '#27c16b',
  fail: '#ff6b6b',
  text: '#203a2f',
  sub: '#6b8f80',
  bg: '#f6faf7',
  card: '#fff',
};

export default function PaymentResult() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Support two shapes:
  // 1) Individual query params: ?orderId=..&amount=..&message=..
  // 2) Single JSON payload param: ?response={"orderId":"...","amount":"...","message":"..."}
  let fullName = String(params.fullName ?? params.fullname ?? '');
  let orderId = String(params.orderId ?? params.orderid ?? params.order_id ?? '');
  let amount = String(params.amount ?? '');
  let orderInfo = String(params.orderInfo ?? params.orderinfo ?? '');
  let message = String(params.message ?? '');

  const rawJson = String(params.response ?? params.data ?? '');
  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson);
      if (parsed) {
        fullName = String(parsed.fullName ?? parsed.fullname ?? fullName);
        orderId = String(parsed.orderId ?? parsed.orderid ?? parsed.order_id ?? orderId);
        amount = String(parsed.amount ?? parsed.amountRaw ?? amount);
        orderInfo = String(parsed.orderInfo ?? parsed.orderinfo ?? orderInfo);
        message = String(parsed.message ?? parsed.msg ?? message);
      }
    } catch {
      // not JSON — ignore
    }
  }

  const isSuccess = /success/i.test(message) || /success/i.test(orderInfo) || message.toLowerCase().includes('ok') || message.toLowerCase().includes('thành công');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={isSuccess ? 'checkmark-circle' : 'close-circle'} size={72} color={isSuccess ? COLORS.success : COLORS.fail} />
          </View>
          <Text style={[styles.title, { color: isSuccess ? COLORS.success : COLORS.fail }]}>
            {isSuccess ? 'Payment Successful' : 'Payment Failed'}
          </Text>

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>{orderId || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{amount ? Number(amount).toLocaleString() : '-'}</Text>
          </View>

          <View style={{ marginTop: 18 }}>
            {orderId ? (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.sub }]}
                onPress={() => router.push({ pathname: '/order/[id]', params: { id: orderId } } as any)}
              >
                <Text style={{ color: COLORS.text, fontWeight: '700' }}>View Order</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, { marginTop: 10, backgroundColor: COLORS.success }]}
              onPress={() => router.replace('/(tabs)/home' as any)}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  card: { backgroundColor: COLORS.card, padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, elevation: 2 },
  iconWrap: { marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  message: { color: COLORS.sub, textAlign: 'center', marginBottom: 12 },
  row: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderColor: '#f0f0f0', marginTop: 6 },
  label: { color: COLORS.sub },
  value: { fontWeight: '700', color: COLORS.text },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
});
