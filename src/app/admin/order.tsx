import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { apiClient } from "../../api/apiClient";

export default function OrderScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [delivery, setDelivery] = useState<any | null>(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

  // 🧭 Load danh sách order
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/api/Order");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleUpdateOrderStatus(orderId: number, newStatus: number) {
  try {
    await apiClient.put(`/api/Order/${orderId}/status`, {
      status: newStatus,
      confirmedAt: new Date().toISOString(),
    });
    Alert.alert("✅ Updated", "Order status updated successfully.");
    // reload lại orders và delivery
    const updatedOrders = await apiClient.get("/api/Order");
    setOrders(updatedOrders.data);
    await fetchDelivery(orderId);
  } catch (err: any) {
    Alert.alert("❌ Error", err.message || "Failed to update order status.");
  }
}


  // 🧭 Khi mở order → fetch delivery theo orderId
  async function fetchDelivery(orderId: number) {
    try {
      setLoadingDelivery(true);
      const res = await apiClient.get(`/api/Delivery/by-order/${orderId}`);
      setDelivery(res.data);
    } catch {
      setDelivery(null); // chưa có delivery
    } finally {
      setLoadingDelivery(false);
    }
  }

  async function handleCreateDelivery(orderId: number) {
    try {
      const res = await apiClient.post("/api/Delivery", { orderId });
      Alert.alert("✅ Success", "Delivery created successfully.");
      setDelivery(res.data);
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Failed to create delivery.");
    }
  }

  async function handleUpdateDeliveryStatus(orderId: number, newStatus: number) {
    try {
      await apiClient.put("/api/Delivery/status", {
        orderId,
        status: newStatus,
        deliveredAt: new Date().toISOString(),
      });
      Alert.alert("✅ Updated", "Delivery status has been updated.");
      await fetchDelivery(orderId);
    } catch (err: any) {
      Alert.alert("❌ Error", err.message || "Failed to update status.");
    }
  }

  const renderOrder = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        setSelectedOrder(item);
        fetchDelivery(item.id);
      }}
      activeOpacity={0.8}
    >
      <Text style={styles.orderId}>Order #{item.id}</Text>
      <Text style={styles.line}>Sender: {item.senderName}</Text>
      <Text style={styles.line}>Recipient: {item.recipient}</Text>
      <Text style={styles.line}>Total: ${item.total.toFixed(2)}</Text>
      <Text style={[styles.status, getOrderStatusStyle(item.status)]}>
        {mapOrderStatus(item.status)}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#27c16b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Management</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal hiển thị chi tiết + Delivery */}
      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Order #{selectedOrder?.id}</Text>
              <Text>Sender: {selectedOrder?.senderName}</Text>
              <Text>Email: {selectedOrder?.senderEmail}</Text>
              <Text>Phone: {selectedOrder?.senderPhone}</Text>
              <Text>Recipient: {selectedOrder?.recipient}</Text>
              <Text>
                Delivery date:{" "}
                {new Date(selectedOrder?.deliveryDate).toLocaleDateString()}
              </Text>

              <Text style={styles.sectionTitle}>Items:</Text>
              {selectedOrder?.items?.map((it: any) => (
                <View key={it.id} style={styles.itemRow}>
                  <Text>{it.flowerName}</Text>
                  <Text>x{it.quantity}</Text>
                  <Text>${it.lineTotal}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>Payment:</Text>
              <Text>Method: {mapPaymentMethod(selectedOrder?.payment?.method)}</Text>
              <Text>Amount: ${selectedOrder?.payment?.amount}</Text>
              <Text>Status: {mapPaymentStatus(selectedOrder?.payment?.status)}</Text>

              <Text style={styles.sectionTitle}>Update Order Status:</Text>
<View style={styles.statusButtons}>
  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
    <TouchableOpacity
      key={s}
      style={styles.statusBtn}
      onPress={() => handleUpdateOrderStatus(selectedOrder.id, s)}
    >
      <Text style={{ color: "#fff", fontSize: 12 }}>
        {mapOrderStatus(s)}
      </Text>
    </TouchableOpacity>
  ))}
</View>


              {/* 🚚 DELIVERY SECTION */}
              <Text style={styles.sectionTitle}>Delivery:</Text>
              {loadingDelivery ? (
                <ActivityIndicator size="small" color="#27c16b" />
              ) : delivery ? (
                <>
                  <Text>Status: {mapDeliveryStatus(delivery.status)}</Text>
                  <Text>
                    Delivered At:{" "}
                    {delivery.deliveredAt
                      ? new Date(delivery.deliveredAt).toLocaleString()
                      : "Not yet"}
                  </Text>
                  {delivery.proofPhotoUrl && (
                    <Text>Proof: {delivery.proofPhotoUrl}</Text>
                  )}

                  <Text style={styles.sectionTitle}>Update Delivery Status:</Text>
                  <View style={styles.statusButtons}>
                    {[0, 1, 2, 3, 4, 5, 6].map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={styles.statusBtn}
                        onPress={() =>
                          handleUpdateDeliveryStatus(selectedOrder.id, s)
                        }
                      >
                        <Text style={{ color: "#fff", fontSize: 12 }}>
                          {mapDeliveryStatus(s)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => handleCreateDelivery(selectedOrder.id)}
                >
                  <Text style={styles.createText}>+ Create Delivery</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setSelectedOrder(null);
                  setDelivery(null);
                }}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* 🧭 ENUM MAPPERS */
function mapOrderStatus(status: number) {
  switch (status) {
    case 1: return "Pending";
    case 2: return "Confirmed";
    case 3: return "Preparing";
    case 4: return "Out for Delivery";
    case 5: return "Delivered";
    case 6: return "Cancelled";
    case 7: return "Refunded";
    default: return "Unknown";
  }
}

function mapPaymentStatus(status: number) {
  switch (status) {
    case 0: return "Unpaid";
    case 1: return "Authorized";
    case 2: return "Paid";
    case 3: return "Failed";
    case 4: return "Refunded";
    case 5: return "Partially Refunded";
    default: return "Unknown";
  }
}

function mapPaymentMethod(method: number) {
  switch (method) {
    case 0: return "Unknown";
    case 1: return "Cash on Delivery";
    default: return "Other";
  }
}

function mapDeliveryStatus(status: number) {
  switch (status) {
    case 0: return "Not Started";
    case 1: return "Assigned";
    case 2: return "Picked Up";
    case 3: return "In Transit";
    case 4: return "Delivered";
    case 5: return "Failed";
    case 6: return "Returned";
    default: return "Unknown";
  }
}

/* 🎨 Helpers */
function getOrderStatusStyle(status: number) {
  switch (status) {
    case 1: return { color: "#999" };
    case 2: return { color: "#007bff" };
    case 3: return { color: "#ff9900" };
    case 4: return { color: "#17a2b8" };
    case 5: return { color: "#28a745" };
    case 6: return { color: "#dc3545" };
    case 7: return { color: "#6c757d" };
    default: return { color: "#666" };
  }
}

/* 🎨 Styles */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 2,
  },
  orderId: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  line: { color: "#555" },
  status: { fontWeight: "bold", marginTop: 6 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    maxHeight: "85%",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  sectionTitle: { marginTop: 10, fontWeight: "bold", color: "#27c16b" },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  closeBtn: {
    marginTop: 16,
    backgroundColor: "#27c16b",
    padding: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  closeText: { color: "#fff", fontWeight: "bold" },
  createBtn: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  createText: { color: "#fff", fontWeight: "bold" },
  statusButtons: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  statusBtn: {
    backgroundColor: "#27c16b",
    padding: 6,
    borderRadius: 6,
  },
  
});
