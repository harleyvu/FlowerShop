import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './APIconfig';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyBip7sULJoCXfitgcPyWK20j5RIEYI6LtM';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

  // Chat AI state
  const [chatVisible, setChatVisible] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { sender: 'user' | 'ai'; text: string }[]
  >([]);
  const scrollRef = useRef<ScrollView>(null);

  // Load userData
  useEffect(() => {
    const loadUserData = async () => {
      const stored = await AsyncStorage.getItem('userData');
      if (stored) setUserData(JSON.parse(stored));
    };
    loadUserData();
  }, []);

  // Fetch flowers
  useEffect(() => {
    const fetchFlowers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Flower`);
        const data = await res.json();
        setFlowers(data);
        await AsyncStorage.setItem('flowersData', JSON.stringify(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFlowers();
  }, []);

  // Cart functions
  const handleAddToCart = (item: Flower) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.flowerId === item.id);
      if (existing)
        return prev.map((c) =>
          c.flowerId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      return [...prev, { flowerId: item.id, quantity: 1, unitPrice: item.price, name: item.name }];
    });
    Alert.alert('🛒 Added', `${item.name} đã được thêm vào giỏ.`);
  };
  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Chat AI
  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollToEnd({ animated: true });
  };

  const callAI = async (input: string) => {
    try {
      const flowersText = flowers
        .map(f => `- ${f.name} (Loại: ${f.category}, Giá: ${f.price} VND, Mô tả: ${f.description})`)
        .join('\n');
      const historyText = chatMessages.map(m => `${m.sender === 'user' ? 'Người dùng' : 'AI'}: ${m.text}`).join('\n');
      const prompt = `
Bạn là trợ lý tư vấn hoa.
Danh sách hoa hiện có:
${flowersText}

Lịch sử chat:
${historyText}

Câu hỏi khách hàng: "${input}"
Nhiệm vụ: Đưa ra 1-2 loại hoa phù hợp và gợi ý mức giá. Trả lời thân thiện bằng tiếng Việt, ngắn gọn.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error(err);
      return 'Lỗi AI: Không thể kết nối';
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput }]);
    setChatInput('');

    const aiText = await callAI(chatInput);
    setChatMessages(prev => [...prev, { sender: 'ai', text: aiText }]);
    setTimeout(scrollToBottom, 100);
  };

  // Render flowers
  const renderItem = ({ item }: { item: Flower }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text numberOfLines={2} style={styles.desc}>{item.description}</Text>
        <Text style={styles.price}>{item.price} VND</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
          <Text style={styles.addText}>+ Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#FF69B4" />
      <Text>Loading flowers...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌸 Spring Flowers</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.welcome}>Welcome, {userData?.user?.firstName || 'Guest'}!</Text>

      {/* List flowers */}
      <FlatList
        data={flowers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 180 }}
      />

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

      {/* Chat AI Button */}
      <TouchableOpacity
        style={styles.chatBtn}
        onPress={() => {
          setChatVisible(!chatVisible);
          if (!chatVisible && chatMessages.length === 0) {
            setChatMessages([{ sender: 'ai', text: 'Chào bạn! Tôi có thể tư vấn loại hoa và gợi ý giá phù hợp.' }]);
          }
        }}
      >
        <Text style={styles.chatBtnText}>{chatVisible ? 'Đóng Chat' : 'Chat AI'}</Text>
      </TouchableOpacity>

      {/* Chat Modal */}
      {chatVisible && (
        <View style={styles.chatContainer}>
          <ScrollView ref={scrollRef} style={styles.chatMessages}>
            {chatMessages.map((msg, i) => (
              <View key={i} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginVertical: 2 }}>
                <View style={[styles.chatBubble, { backgroundColor: msg.sender === 'user' ? '#FF69B4' : '#EEE' }]}>
                  <Text style={{ color: msg.sender === 'user' ? '#FFF' : '#000' }}>{msg.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Nhập câu hỏi..."
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleChatSubmit}
            />
            <TouchableOpacity style={styles.chatSendBtn} onPress={handleChatSubmit}>
              <Text style={{ color: '#FFF' }}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// Styles giữ nguyên
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FA', paddingHorizontal: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFE4E1', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 16, marginTop: 10, elevation: 3 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FF69B4' },
  menuBtn: { backgroundColor: '#FFB6C1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  menuIcon: { fontSize: 22, color: '#C2185B', fontWeight: 'bold' },
  welcome: { fontSize: 14, color: '#555', textAlign: 'center', marginVertical: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, width: '48%', marginBottom: 15, shadowColor: '#FFB6C1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5, overflow: 'hidden' },
  image: { width: '100%', height: 130 },
  info: { padding: 10 },
  name: { fontSize: 16, fontWeight: '600', color: '#FF69B4' },
  desc: { fontSize: 12, color: '#666', marginVertical: 4 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#E91E63' },
  addBtn: { marginTop: 8, backgroundColor: '#FF69B4', borderRadius: 20, paddingVertical: 6, alignItems: 'center' },
  addText: { color: 'white', fontWeight: '600', fontSize: 13 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  orderBtn: { backgroundColor: '#FF69B4', borderRadius: 25, paddingVertical: 8, paddingHorizontal: 20, marginTop: 12 },
  orderText: { color: '#FFF', fontWeight: 'bold' },
  closeText: { color: '#888', marginTop: 10 },
  chatBtn: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#FF69B4', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 25, elevation: 5 },
  chatBtnText: { color: '#FFF', fontWeight: 'bold' },
  chatContainer: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    width: '80%',
    height: 400,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFB6C1',
    overflow: 'hidden',
    elevation: 5,
  },
  chatMessages: { flex: 1, padding: 8 },
  chatBubble: { padding: 8, borderRadius: 12, maxWidth: 250 },
  chatInputContainer: { flexDirection: 'row', padding: 6, borderTopWidth: 1, borderColor: '#CCC' },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#CCC', borderRadius: 20, paddingHorizontal: 12 },
  chatSendBtn: { backgroundColor: '#FF69B4', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 20, marginLeft: 4 },
});
