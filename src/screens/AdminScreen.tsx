import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { orderService } from "../services/orderService";
import { deliveryService } from "../services/deliveryService";

export default function AdminDeliveryList({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchOrders = async () => {
    try {
      const stored = await AsyncStorage.getItem("userData");
      if (!stored) return;
      const userData = JSON.parse(stored);

      // 👉 Gọi API lấy tất cả đơn hàng (admin)
      const data = await orderService.getAllOrders(userData.token);

      setOrders(data);
      console.log("✅ Fetched all orders:", data);
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
}, []);


  const createDelivery = async (orderId: number) => {
    try {
      const delivery = await deliveryService.createDelivery(orderId);
      Alert.alert("Success", `Delivery created with ID #${delivery.id}`);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const openUpdate = (orderId: number) => {
    navigation.navigate("AdminDeliveryUpdate", { orderId });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E91E63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚚 Manage Deliveries</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderText}>Order #{item.id}</Text>
            <Text>Total: ${item.total.toFixed(2)}</Text>

            <View style={styles.btnGroup}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#4CAF50" }]}
                onPress={() => createDelivery(item.id)}
              >
                <Text style={styles.btnText}>Create</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#E91E63" }]}
                onPress={() => openUpdate(item.id)}
              >
                <Text style={styles.btnText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7FA", padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C2185B",
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  orderText: { fontWeight: "bold", color: "#E91E63" },
  btnGroup: { flexDirection: "row", marginTop: 10, justifyContent: "space-between" },
  btn: { flex: 1, marginHorizontal: 4, padding: 8, borderRadius: 10 },
  btnText: { color: "#FFF", textAlign: "center", fontWeight: "bold" },
  backBtn: {
    marginTop: 10,
    backgroundColor: "#FFB6C1",
    borderRadius: 25,
    alignItems: "center",
    paddingVertical: 10,
  },
  backText: { color: "#FFF", fontWeight: "bold" },
});
