import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { restoreAuthToken } from "../../api/apiClient";
import * as orderApi from "../../api/orderModel";
import { restoreUser } from "../../controllers/userController";

const COLORS = {
  primary: "#27c16b",
  dark: "#1f7a4c",
  text: "#203a2f",
  sub: "#6b8f80",
  bg: "#f6faf7",
  card: "#ffffff",
  border: "#e6eee9",
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await restoreUser();
      const token = await restoreAuthToken();
      const userId = user?.id;
      if (!userId) {
        setError("User not found. Please log in again.");
        setOrders([]);
        return;
      }
      const data = await orderApi.getOrdersByUser(userId, token ?? undefined);
      setOrders(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load your orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
      return () => {};
    }, [fetchOrders])
  );

  const renderStatusBadge = (status: number) => {
    let bgColor = "#ccc";
    let label = "Unknown";

    switch (status) {
      case 1:
        bgColor = "#ffb84d"; // orange
        label = "Pending Confirmation";
        break;
      case 2:
        bgColor = "#27c16b"; // green
        label = "Confirmed";
        break;
      case 3:
        bgColor = "#4da6ff"; // blue
        label = "Preparing Order";
        break;
      case 4:
        bgColor = "#33cccc"; // teal
        label = "Out for Delivery";
        break;
      case 5:
        bgColor = "#27c16b"; // green
        label = "Delivered";
        break;
      case 6:
        bgColor = "#ff6b6b"; // red
        label = "Cancelled";
        break;
      case 7:
        bgColor = "#999"; // gray
        label = "Refunded";
        break;
    }

    return (
      <View
        style={{
          backgroundColor: bgColor,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>
          {label}
        </Text>
      </View>
    );
  };

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  if (error)
    return (
      <View style={styles.center}>
        <Text style={{ color: "crimson" }}>{error}</Text>
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.brand}>Flowerfly</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="cart-outline" size={20} color={COLORS.dark} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(it) => String(it.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchOrders();
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/order/[id]",
                params: { id: String(item.id) },
              } as any)
            }
          >
            <View style={styles.card}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                {renderStatusBadge(item.status)}
              </View>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              <View style={styles.orderSummary}>
                <Text style={{ color: COLORS.sub }}>
                  Items: {item.items?.length ?? 0}
                </Text>
                <Text style={styles.totalText}>${item.total}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: COLORS.sub, marginTop: 20 }}>
            You don't have any orders yet.
          </Text>
        }
        contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

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

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  orderId: { fontWeight: "700", color: COLORS.text, fontSize: 16 },
  orderDate: { color: COLORS.sub, fontSize: 12, marginTop: 4 },
  orderSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  totalText: { fontWeight: "700", color: COLORS.dark },
});
