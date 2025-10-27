import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiClient } from "../../api/apiClient";

interface Flower {
  id: number;
  name: string;
  category?: number;
  stock: number;
}

interface Order {
  id: number;
  total: number;
  status: number; // 0: Pending, 1: Confirmed, 2: Delivered, 3: Cancelled
  items: { flowerName: string; quantity: number; lineTotal: number }[];
}

export default function Dashboard() {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrdersDetail, setShowOrdersDetail] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const flowerCategories: Record<number, string> = {
    1: "Roses",
    2: "Tulips",
    3: "Daisies",
    4: "Lilies",
    5: "Orchids",
    6: "Sunflowers",
    7: "Carnations",
    8: "Mixed Bouquets",
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [flowersRes, ordersRes] = await Promise.all([
        apiClient.get("/api/Flower"),
        apiClient.get("/api/Order"),
      ]);
      setFlowers(flowersRes.data);
      setOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
      setFlowers([]);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27c16b" />
      </View>
    );
  }

  // Tổng quan
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

  // Đếm loại hoa theo category
  const categoryCount: Record<string, number> = {};
  flowers.forEach((f) => {
    const cat = f.category ? flowerCategories[f.category] || "Unknown" : "Unknown";
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });

  // Trạng thái đơn hàng
  const statusCounts = orders.reduce(
    (acc, o) => {
      switch (o.status) {
        case 0:
          acc.pending++;
          break;
        case 1:
          acc.confirmed++;
          break;
        case 2:
          acc.delivered++;
          break;
        case 3:
          acc.cancelled++;
          break;
      }
      return acc;
    },
    { pending: 0, confirmed: 0, delivered: 0, cancelled: 0 }
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      {/* Tổng quan */}
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowOrdersDetail(!showOrdersDetail)}
        >
          <Text style={styles.cardTitle}>Total Orders</Text>
          <Text style={styles.cardValue}>{totalOrders}</Text>
        </TouchableOpacity>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Revenue</Text>
          <Text style={styles.cardValue}>{totalRevenue.toLocaleString()}₫</Text>
        </View>
      </View>

      {/* Trạng thái đơn */}
      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Pending</Text>
          <Text style={styles.cardValue}>{statusCounts.pending}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confirmed</Text>
          <Text style={styles.cardValue}>{statusCounts.confirmed}</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivered</Text>
          <Text style={styles.cardValue}>{statusCounts.delivered}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cancelled</Text>
          <Text style={styles.cardValue}>{statusCounts.cancelled}</Text>
        </View>
      </View>

      {/* Loại hoa */}
      <Text style={styles.sectionTitle}>
        Flower Types ({Object.keys(categoryCount).length})
      </Text>

      {Object.entries(categoryCount).map(([cat, count]) => (
        <View key={cat} style={styles.categoryBlock}>
          <TouchableOpacity
            onPress={() =>
              setExpandedCategory(expandedCategory === cat ? null : cat)
            }
          >
            <Text style={styles.item}>
              {cat}: {count} types{" "}
              {expandedCategory === cat ? "▲" : "▼"}
            </Text>
          </TouchableOpacity>

          {expandedCategory === cat &&
            flowers
              .filter(
                (f) =>
                  flowerCategories[f.category || 0] === cat
              )
              .map((f) => (
                <View key={f.id} style={styles.flowerDetail}>
                  <Text style={styles.flowerName}>
                    • {f.name}
                  </Text>
                  <Text style={styles.stockText}>
                    Stock: {f.stock}
                  </Text>
                </View>
              ))}
        </View>
      ))}

      {/* Chi tiết đơn khi click Total Orders */}
      {showOrdersDetail && (
        <>
          <Text style={styles.sectionTitle}>Orders Detail</Text>
          {orders.map((o) => (
            <View key={o.id} style={styles.orderCard}>
              <Text style={styles.bold}>
                Order #{o.id} - {o.total.toLocaleString()}₫
              </Text>
              <Text>
                Status: {["Pending", "Confirmed", "Delivered", "Cancelled"][o.status]}
              </Text>
              <Text>Items:</Text>
              {o.items.map((it, idx) => (
                <Text key={idx}>
                  - {it.flowerName} x {it.quantity} ={" "}
                  {it.lineTotal.toLocaleString()}₫
                </Text>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginTop: 16, marginBottom: 8 },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    elevation: 2,
  },
  cardTitle: { fontSize: 14, color: "#555", marginBottom: 8 },
  cardValue: { fontSize: 20, fontWeight: "bold" },
  categoryBlock: { marginBottom: 8 },
  item: { fontSize: 15, fontWeight: "bold", paddingVertical: 6 },
  flowerDetail: { marginLeft: 16, marginTop: 4 },
  flowerName: { fontSize: 14 },
  stockText: { fontSize: 13, color: "#666" },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  bold: { fontWeight: "bold" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
