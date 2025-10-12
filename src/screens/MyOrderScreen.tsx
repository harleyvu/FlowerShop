import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService } from '../services/orderService';

interface OrderItem {
  flowerId: number;
  flowerName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Payment {
  method: number;
  status: number;
  amount: number;
}

interface Delivery {
  status: number;
}

interface Order {
  id: number;
  createdAt: string;
  status: number;
  total: number;
  items: OrderItem[];
  payment: Payment | null;
  delivery: Delivery | null;
}

export default function MyOrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [flowersMap, setFlowersMap] = useState<{ [key: number]: string }>({});

  // Load userData từ AsyncStorage
  useEffect(() => {
    const loadUserData = async () => {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) setUserData(JSON.parse(stored));
    };
    loadUserData();
  }, []);

  // Load flowersMap từ AsyncStorage
  useEffect(() => {
    const loadFlowerData = async () => {
      const stored = await AsyncStorage.getItem('flowersData');
      if (stored) {
        const flowersArray = JSON.parse(stored);
        const map: { [key: number]: string } = {};
        flowersArray.forEach((f: any) => {
          map[f.id] = f.name;
        });
        setFlowersMap(map);
      }
    };
    loadFlowerData();
  }, []);

  // Fetch orders từ API
  useEffect(() => {
    if (!userData) return;

    const fetchOrders = async () => {
  try {
    const token = userData.token;
    const userId = userData.user.id;
    const data = await orderService.getOrders(userId, token);
    setOrders(data);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
  } finally {
    setLoading(false);
  }
};

    fetchOrders();
  }, [userData]);

  // Toggle expand order
  const toggleExpand = (id: number) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Navigate to PaymentScreen với toàn bộ order
  const goToPayment = (order: Order) => {
    navigation.navigate('PaymentScreen', { order });
  };

  // Xác nhận xóa order
  const confirmDeleteOrder = (orderId: number) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete order #${orderId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteOrder(orderId) },
      ]
    );
  };

  // Xóa order qua API
  const deleteOrder = async (orderId: number) => {
  try {
    const token = userData.token;
    await orderService.deleteOrder(orderId, token);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    Alert.alert("Deleted", `Order #${orderId} has been deleted.`);
  } catch (error) {
    console.error("❌ Delete order error:", error);
    Alert.alert("Error", "Failed to delete order.");
  }
};

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
        <Text style={styles.orderStatus}>Status: {getOrderStatus(item.status)}</Text>
        <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
        <Text style={styles.paymentText}>
          Payment: {item.payment
            ? `${getPaymentMethod(item.payment.method)} (${getPaymentStatus(item.payment.status)})`
            : 'Not Available'}
        </Text>
        <Text style={styles.deliveryText}>
          Delivery: {item.delivery ? getDeliveryStatus(item.delivery.status) : 'Not Available'}
        </Text>
      </TouchableOpacity>

      {expandedOrderId === item.id && (
        <View style={styles.orderItems}>
          {item.items.map((i, idx) => (
            <Text key={idx} style={styles.itemText}>
              {flowersMap[i.flowerId] || `Flower #${i.flowerId}`} × {i.quantity} — ${i.lineTotal.toFixed(2)}
            </Text>
          ))}

          {/* Nút Payment */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#4CAF50' }]}
            onPress={() => goToPayment(item)}
          >
            <Text style={styles.actionText}>Payment</Text>
          </TouchableOpacity>

          {/* Nút Delete */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#F44336', marginTop: 6 }]}
            onPress={() => confirmDeleteOrder(item.id)}
          >
            <Text style={styles.actionText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const getOrderStatus = (status: number) => {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Confirmed';
      case 3: return 'Preparing';
      case 4: return 'Out For Delivery';
      case 5: return 'Delivered';
      case 6: return 'Cancelled';
      case 7: return 'Refunded';
      default: return 'Unknown';
    }
  };

  const getPaymentStatus = (status: number) => {
    switch (status) {
      case 0: return 'Unpaid';
      case 1: return 'Authorized';
      case 2: return 'Paid';
      case 3: return 'Failed';
      case 4: return 'Refunded';
      case 5: return 'Partially Refunded';
      default: return 'Unknown';
    }
  };

  const getPaymentMethod = (method: number) => {
    switch (method) {
      case 0: return 'Unknown';
      case 1: return 'Cash On Delivery';
      default: return 'Other';
    }
  };

  const getDeliveryStatus = (status: number) => {
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
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={{ color: '#FF69B4', marginTop: 10 }}>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>You have no orders yet.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FA', padding: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  orderId: { fontWeight: 'bold', color: '#C2185B' },
  orderDate: { fontSize: 12, color: '#555' },
  orderStatus: { marginTop: 4, fontSize: 14, color: '#444' },
  orderTotal: { marginTop: 2, fontSize: 14, fontWeight: 'bold', color: '#E91E63' },
  paymentText: { fontSize: 13, color: '#444', marginTop: 2 },
  deliveryText: { fontSize: 13, color: '#444', marginTop: 2 },
  orderItems: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 6 },
  itemText: { fontSize: 13, color: '#555', marginVertical: 2 },
  actionBtn: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  actionText: { color: '#FFF', fontWeight: 'bold' },
  backBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#FFB6C1',
    borderRadius: 25,
  },
  backText: { color: '#FFF', fontWeight: 'bold' },
});
