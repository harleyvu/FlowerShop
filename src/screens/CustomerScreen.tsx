import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  ActivityIndicator, Alert, Modal, ScrollView, TextInput, StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { flowerService } from "../services/flowerService";
import { orderService } from "../services/orderService";
import { aiService } from "../services/aiService";

// 🧩 Types
interface Flower {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  stock: number;
  category: number;
}
interface CartItem {
  flowerId: number;
  quantity: number;
  unitPrice: number;
  name?: string;
}

export default function CustomerScreen({ navigation }: any) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  // 🌸 Group by category
  const categoryNames: Record<number, string> = {
    1: "Roses 🌹",
    2: "Tulips 🌷",
    3: "Daisies 🌼",
    4: "Lilies 🌸",
    5: "Orchids 🌺",
    6: "Sunflowers 🌻",
    7: "Carnations 💐",
    8: "Mixed Bouquets 💞",
  };

  const grouped = flowers.reduce((acc: Record<number, Flower[]>, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  const [expanded, setExpanded] = useState<number[]>([]);

  const toggleCategory = (catId: number) => {
    setExpanded(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };


  // Load user
  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem("userData");
      if (stored) setUserData(JSON.parse(stored));
    })();
  }, []);

  // Fetch hoa
  useEffect(() => {
    (async () => {
      try {
        const data = await flowerService.getAll();
        setFlowers(data);
        await AsyncStorage.setItem("flowersData", JSON.stringify(data));
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải danh sách hoa");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🛒 Add to Cart
  const handleAddToCart = (item: Flower) => {
    setCart(prev => {
      const existing = prev.find(c => c.flowerId === item.id);
      if (existing)
        return prev.map(c => c.flowerId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { flowerId: item.id, quantity: 1, unitPrice: item.price, name: item.name }];
    });
    Alert.alert("🛒 Added", `${item.name} đã được thêm vào giỏ.`);
  };

  const totalAmount = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  // 📦 Place Order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) return Alert.alert("⚠️", "Giỏ hàng trống.");

    try {
      const token = userData?.token;
      const userId = userData?.user?.id;
      const orderBody = {
        customerUserId: userId,
        senderName: `${userData?.user?.firstName || ""} ${userData?.user?.lastName || ""}`.trim(),
        senderEmail: userData?.user?.email,
        senderPhone: userData?.user?.phoneNumber || "0000000000",
        recipient: "Friend",
        deliveryDate: new Date().toISOString(),
        deliveryTimeWindow: 0,
        shippingFee: 0,
        paymentMethod: 1,
        items: cart.map(c => ({ flowerId: c.flowerId, quantity: c.quantity, unitPrice: c.unitPrice })),
      };
      await orderService.createOrder(orderBody, token);
      Alert.alert("✅ Thành công", "Đơn hàng đã được tạo!");
      setCart([]); setCartVisible(false);
    } catch (e: any) {
      Alert.alert("❌ Lỗi", e.message);
    }
  };

  // 🤖 Chat AI
  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: "user", text: chatInput }]);
    const aiText = await aiService.askAI(chatInput, flowers, chatMessages);
    setChatMessages(prev => [...prev, { sender: "ai", text: aiText }]);
    setChatInput("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" /><Text>Loading...</Text></View>;

  return (
    <View style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌸 Spring Flowers</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)}><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
      </View>

      <ScrollView>
  {Object.entries(grouped).map(([catId, items]) => {
    const isOpen = expanded.includes(Number(catId));
    return (
      <View key={catId} style={styles.categorySection}>
        {/* Header */}
        <TouchableOpacity
          onPress={() => toggleCategory(Number(catId))}
          style={styles.categoryHeader}
        >
          <Text style={styles.categoryTitle}>
            {categoryNames[Number(catId)] || `Category ${catId}`}
          </Text>
          <Text style={styles.expandIcon}>{isOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {/* Grid items */}
        {isOpen && (
          <View style={styles.flowerGrid}>
            {items.map((item) => (
              <View key={item.id} style={styles.cardBox}>
                <Image source={{ uri: item.imageUrl }} style={styles.imageBox} />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.price} VND</Text>
                <TouchableOpacity
                  onPress={() => handleAddToCart(item)}
                  style={styles.addBtn}
                >
                  <Text style={{ color: "#fff" }}>+ Add</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  })}
</ScrollView>



      {/* Menu Modal */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); setCartVisible(true); }}>
              <Text style={styles.menuText}>🛒 View Cart ({cart.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); navigation.navigate('MyOrders'); }}>
              <Text style={styles.menuText}>📄 My Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={async () => { await AsyncStorage.removeItem('userData'); setMenuVisible(false); navigation.replace('Login'); }}>
              <Text style={styles.menuText}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Cart Modal */}
      <Modal visible={cartVisible} transparent animationType="slide">
        <View style={styles.cartOverlay}>
          <View style={styles.cartBox}>
            <Text style={styles.cartTitle}>🛒 Your Cart</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {cart.length === 0 ? <Text style={styles.emptyCart}>Your cart is empty.</Text> :
                cart.map((item, i) => <Text key={i} style={styles.cartItem}>{item.name} × {item.quantity} — {item.unitPrice * item.quantity} VND</Text>)}
            </ScrollView>
            <Text style={styles.cartTotal}>Total: {totalAmount} VND</Text>
            <TouchableOpacity style={styles.orderBtn} onPress={() => Alert.alert('Place Order')}>
              <Text style={styles.orderText}>📦 Place Order</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCartVisible(false)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chat button */}
      <TouchableOpacity style={styles.chatBtn} onPress={() => {
        setChatVisible(!chatVisible);
        if (!chatVisible && chatMessages.length === 0)
          setChatMessages([{ sender: "ai", text: "Chào bạn, tôi có thể giúp tư vấn hoa phù hợp 🌸" }]);
      }}>
        <Text style={{ color: "#fff" }}>{chatVisible ? "Đóng Chat" : "Chat AI"}</Text>
      </TouchableOpacity>

      {/* Chat modal */}
      {chatVisible && (
        <View style={styles.chatBox}>
          <ScrollView ref={scrollRef}>{chatMessages.map((m, i) => (
            <View key={i} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", margin: 3 }}>
              <Text style={{ backgroundColor: m.sender === "user" ? "#FF69B4" : "#EEE", padding: 6, borderRadius: 10, color: m.sender === "user" ? "#fff" : "#000" }}>{m.text}</Text>
            </View>
          ))}</ScrollView>
          <View style={styles.chatInputRow}>
            <TextInput style={styles.chatInput} placeholder="Nhập câu hỏi..." value={chatInput} onChangeText={setChatInput} />
            <TouchableOpacity style={styles.sendBtn} onPress={handleChatSubmit}><Text style={{ color: "#fff" }}>Gửi</Text></TouchableOpacity>
          </View>
        </View>
      )}

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7FA", padding: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  headerTitle: { fontSize: 20, color: "#FF69B4", fontWeight: "bold" },
  menuIcon: { fontSize: 22 },
  card: { backgroundColor: "#FFF", borderRadius: 12, padding: 10, margin: 5, width: "48%", alignItems: "center" },
  image: { width: 100, height: 100, borderRadius: 8 },
  name: { fontWeight: "bold", marginTop: 5 },
  price: { color: "#E91E63", marginVertical: 3 },
  addBtn: { backgroundColor: "#FF69B4", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  chatBtn: { position: "absolute", bottom: 80, right: 20, backgroundColor: "#FF69B4", borderRadius: 25, padding: 10 },
  chatBox: { position: "absolute", bottom: 200, left: 20, right: 20, height: 300, backgroundColor: "#FFF", borderRadius: 12, borderWidth: 1, borderColor: "#FFB6C1", padding: 10 },
  chatInputRow: { flexDirection: "row", borderTopWidth: 1, borderColor: "#DDD", marginTop: 10 },
  chatInput: { flex: 1, borderWidth: 1, borderColor: "#DDD", borderRadius: 20, paddingHorizontal: 10 },
  sendBtn: { backgroundColor: "#FF69B4", paddingHorizontal: 14, marginLeft: 5, justifyContent: "center", borderRadius: 20 },
  modal: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#C2185B", marginBottom: 10 },
  orderBtn: { backgroundColor: "#FF69B4", padding: 10, borderRadius: 20, marginTop: 10 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  menuBtn: { backgroundColor: '#FFB6C1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 15 },
  menuContainer: { backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 8, width: 180, elevation: 5 },
  menuItem: { paddingVertical: 10, paddingHorizontal: 15 },
  menuText: { fontSize: 15, color: '#C2185B', fontWeight: '600' },
  cartOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  cartBox: { width: '85%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, alignItems: 'center' },
  cartTitle: { fontSize: 18, fontWeight: 'bold', color: '#C2185B', marginBottom: 10 },
  emptyCart: { color: '#999', fontSize: 14 },
  cartItem: { fontSize: 14, color: '#444', marginVertical: 3 },
  cartTotal: { fontSize: 16, fontWeight: 'bold', color: '#E91E63', marginTop: 10 },
  orderText: { color: '#FFF', fontWeight: 'bold' },
  closeText: { color: '#888', marginTop: 10 },
  
  categorySection: {
  marginBottom: 12,
  backgroundColor: "#fff",
  borderRadius: 10,
  overflow: "hidden",
  elevation: 2,
},
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#FFE4EC",
  },
  categoryTitle: { fontWeight: "bold", color: "#C2185B", fontSize: 16 },
  expandIcon: { fontSize: 16, color: "#C2185B" },

  // ✅ Grid hiển thị item
  flowerGrid: {
    flexDirection: "row",
    flexWrap: "wrap", // cho phép xuống dòng
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 10,
  },

  // ✅ Box mỗi bông hoa
  cardBox: {
    width: "47%", // hai item trên 1 hàng
    backgroundColor: "#FFF7FA",
    borderRadius: 10,
    padding: 8,
    marginTop: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },

  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },

});
