import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // ✅ thêm dòng này
import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../contexts/CartContext';


// Màu sắc đồng bộ với Home
const COLORS = {
  primary: '#27c16b',
  dark: '#1f7a4c',
  text: '#203a2f',
  sub: '#6b8f80',
  bg: '#f6faf7',
  card: '#ffffff',
  border: '#e6eee9',
};

export default function CartScreen() {
  const { items, total, removeFromCart, updateQty } = useCart();
  const router = useRouter(); // ✅ thay vì navigation

  const handleCheckout = () => {
    if (!items.length)
      return Alert.alert('Cart is empty', 'Please add products before ordering');
    router.push('/checkout'); // ✅ Expo Router navigation
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ===== Header ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            router.back(); // ✅ thay navigation.goBack()
          }}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.dark} />
        </TouchableOpacity>
        
        <Text style={styles.brand}>Flowerfly</Text>
       
        <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn}>
              {/* THAY ĐỔI 1: Thay thế Ionicons bằng Image */}
              <Image source={require('../../assets/notification.png')} style={styles.headerIcon} />
            </TouchableOpacity>
        </View>         
         
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        ListHeaderComponent={<Text style={styles.title}>Shopping cart</Text>}
        ListEmptyComponent={<Text style={{ padding: 16 }}>Cart is empty</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemMeta}>Available in stock</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFromCart(item.productId)}
              >
                <Text style={{ color: '#fff' }}>Remove</Text>
              </TouchableOpacity>
              <View style={{ height: 8 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    updateQty(item.productId, Math.max(1, item.quantity - 1))
                  }
                >
                  <Text>-</Text>
                </TouchableOpacity>
                <Text style={{ marginHorizontal: 8 }}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateQty(item.productId, item.quantity + 1)}
                >
                  <Text>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.priceBox}>
        <Text style={styles.priceTitle}>Price details</Text>
        {items.map((it) => (
          <View key={it.productId} style={styles.priceRow}>
            <Text style={{ flex: 1 }}>
              {it.name} x {it.quantity}
            </Text>
            <Text>{(it.price * it.quantity).toLocaleString('vi-VN')} VND</Text>
          </View>
        ))}

        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text>Subtotal</Text>
          <Text>{total.toLocaleString('vi-VN')} VND</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Delivery</Text>
          <Text>Free</Text>
        </View>
        <View
          style={[styles.priceRow, { marginTop: 8, alignItems: 'center' }]}
        >
          <Text style={{ fontWeight: '700', fontSize: 18 }}>Total</Text>
          <Text style={{ fontWeight: '700', fontSize: 18 }}>{total.toLocaleString('vi-VN')} VND</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
          <Text style={{ color: '#fff', fontSize: 16 }}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // ===== Header =====
  header: {
    paddingHorizontal: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.dark,
  },
  brand: {
    fontFamily: 'Pacifico-Regular',
    fontSize: 28,
    color: COLORS.dark,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e9f5ef',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ===== Cart =====
  title: { fontSize: 24, fontWeight: '700', padding: 16, color: COLORS.text },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    backgroundColor: COLORS.card,
  },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  itemMeta: { color: COLORS.sub, marginTop: 4 },
  removeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  qtyBtn: { backgroundColor: '#eee', padding: 6, borderRadius: 6 },

  // ===== Price box =====
  priceBox: {
    margin: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#f8fffb',
    borderColor: '#e5efe8',
    borderWidth: 1,
  },
  priceTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  divider: { height: 1, backgroundColor: '#e6efe8', marginVertical: 8 },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 12,
  },
});
