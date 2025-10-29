import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { restoreAuthToken } from "../api/apiClient";
import * as orderApi from "../api/orderModel";
import { useCart, type CartItem } from "../contexts/CartContext";
import { restoreUser } from "../controllers/userController";

const COLORS = {
  primary: "#27c16b",
  dark: "#1f7a4c",
  text: "#203a2f",
  sub: "#6b8f80",
  bg: "#f6faf7",
  card: "#ffffff",
  border: "#e6eee9",
};

export default function CheckoutScreen() {
  const { items, total, clearCart } = useCart();
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [recipient, setRecipient] = useState("Friend");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePlaceOrder = async () => {
    if (!items.length)
      return Alert.alert("Empty Cart", "Please add products before placing an order.");

    if (!senderName || !senderEmail || !senderPhone) {
      return Alert.alert("Missing Information", "Please fill in your full name, email, and phone number.");
    }

    const token = await restoreAuthToken();
    const storedUser = await restoreUser();

    const orderBody = {
      customerUserId: storedUser?.id ? Number(storedUser.id) : undefined,
      senderName,
      senderEmail,
      senderPhone: senderPhone || "0000000000",
      recipient: recipient || "Friend",
      deliveryDate: new Date().toISOString(),
      deliveryTimeWindow: 0,
      shippingFee: 0,
      paymentMethod: 1,
      items: items.map((i: CartItem) => ({
        flowerId: Number(i.productId),
        quantity: Number(i.quantity),
        unitPrice: Number(i.price),
      })),
    } as any;

    try {
      setLoading(true);
      await orderApi.createOrder(orderBody, token ?? undefined);
      clearCart();
      Alert.alert("Success", "Your order has been created successfully.");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Unable to create order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.brand}>Flowerfly</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.productId}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Checkout</Text>
            <View style={styles.section}>
              <Text style={styles.label}>Sender Information</Text>
              <TextInput
                style={styles.input}
                value={senderName}
                onChangeText={setSenderName}
                placeholder="Full name"
              />
              <TextInput
                style={styles.input}
                value={senderEmail}
                onChangeText={setSenderEmail}
                placeholder="Email address"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                value={senderPhone}
                onChangeText={setSenderPhone}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Delivery Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter address"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Note</Text>
              <TextInput
                style={styles.input}
                value={note}
                onChangeText={setNote}
                placeholder="Note for the seller"
              />
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Products</Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ flex: 1 }}>
              {item.name} × {item.quantity}
            </Text>
            <Text>{(item.price * item.quantity).toLocaleString('vi-VN')} VND</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: COLORS.sub }}>Your cart is empty.</Text>
        }
        ListFooterComponent={
          <>
            <View style={styles.summary}>
              <Text style={styles.totalText}>Total:</Text>
              <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')} VND</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </>
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontFamily: "Pacifico-Regular", fontSize: 32, color: COLORS.dark },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e9f5ef",
    alignItems: "center",
    justifyContent: "center",
  },

  title: { fontSize: 22, fontWeight: "700", color: COLORS.text, marginVertical: 10 },

  section: {
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: { color: COLORS.sub, fontSize: 14, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: COLORS.text,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },

  summary: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  totalText: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  totalValue: { fontSize: 16, fontWeight: "800", color: COLORS.dark },

  checkoutBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
