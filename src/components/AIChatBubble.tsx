import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import aiService from '../api/googleAI';
import { useCart } from '../contexts/CartContext';

type Msg = { id: string; sender: 'user' | 'ai'; text: string };

type Flower = {
  id?: string;
  productId?: string;
  _id?: string;
  name: string;
  price: number;
  stock?: number;
  category?: string;
  cost?: number;
};

export default function AIChatBubble({ flowers }: { flowers: Flower[] }) {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<{ product: Flower; qty: number } | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();

  const addToCartWithQty = (flower: any, qty: number) => {
    if (typeof flower.stock === 'number') {
      if (flower.stock <= 0) {
        const aiMsg: Msg = { 
          id: String(Date.now()), 
          sender: 'ai', 
          text: `Sorry, ${flower.name} is out of stock.` 
        };
        setMsgs((s) => [aiMsg, ...s]);
        Alert.alert('Out of Stock', `${flower.name} is currently out of stock.`);
        return;
      }

      if (qty > flower.stock) {
        const aiMsg: Msg = { 
          id: String(Date.now()), 
          sender: 'ai', 
          text: `Sorry, ${flower.name} only has ${flower.stock} items in stock. Cannot add ${qty} items.` 
        };
        setMsgs((s) => [aiMsg, ...s]);
        
        Alert.alert(
          'Insufficient Stock',
          `${flower.name} only has ${flower.stock} items available. Cannot add ${qty} items to cart.`,
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const added = addToCart(
      { 
        productId: String(((flower.id ?? flower.productId ?? flower._id) || flower.name)),
        name: flower.name,
        price: Number(flower.price ?? 0),
        stock: flower.stock
      },
      qty
    );

    if (!added) {
      const aiMsg: Msg = { 
        id: String(Date.now()), 
        sender: 'ai', 
        text: `Cannot add ${qty} ${flower.name} because it exceeds available stock.` 
      };
      setMsgs((s) => [aiMsg, ...s]);
      Alert.alert(
        'Insufficient Stock',
        `Cannot add ${qty} ${flower.name} because it exceeds available stock.`
      );
      return;
    }

    const aiMsg: Msg = { 
      id: String(Date.now()), 
      sender: 'ai', 
      text: `Added ${qty} ${flower.name} to your cart.` 
    };
    setMsgs((s) => [aiMsg, ...s]);
    
    Alert.alert(
      'Added to Cart',
      `Added ${qty} ${flower.name} to your cart`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => router.push({ pathname: '/cart' } as any) }
      ]
    );
  };

  const flowersText = useMemo(() => {
    return flowers
      .map((f) => `- ${f.name} (Category: ${f.category}, Price: ${f.price} VND${f.stock ? `, Stock: ${f.stock}` : ''})`)
      .join('\n');
  }, [flowers]);

  // Normalize text: remove diacritics, punctuation, lower-case
  const normalizeText = (s: string) => {
    if (!s) return '';
    try {
      // decompose accents then strip combining marks
      return s
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9\s]/gi, '')
        .toLowerCase()
        .trim();
    } catch (e) {
      // Fallback for environments without \p{Diacritic}
      return s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/gi, '')
        .toLowerCase()
        .trim();
    }
  };

  // simple levenshtein distance
  const levenshtein = (a: string, b: string) => {
    if (a === b) return 0;
    const al = a.length;
    const bl = b.length;
    if (al === 0) return bl;
    if (bl === 0) return al;
    const dp = Array.from({ length: al + 1 }, () => new Array(bl + 1).fill(0));
    for (let i = 0; i <= al; i++) dp[i][0] = i;
    for (let j = 0; j <= bl; j++) dp[0][j] = j;
    for (let i = 1; i <= al; i++) {
      for (let j = 1; j <= bl; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[al][bl];
  };

  // helper: find a flower by name in a given text using fuzzy matching
  const findFlowerInText = (txt: string): Flower | null => {
    if (!txt) return null;
    const tNorm = normalizeText(txt);
    const words = tNorm.split(/\s+/).filter(Boolean);

    for (const f of flowers || []) {
      const nameRaw = (f.name || '') as string;
      if (!nameRaw) continue;
      const nameNorm = normalizeText(nameRaw);

      // exact substring match on normalized strings
      if (nameNorm && tNorm.includes(nameNorm)) return f;

      // compute min levenshtein distance between nameNorm and tokens/windows in the text
      let minDist = Infinity;
      // check each word and small windows
      const nameWords = nameNorm.split(/\s+/).filter(Boolean);
      const windowSize = Math.max(1, nameWords.length);
      for (let i = 0; i < words.length; i++) {
        // single word
        minDist = Math.min(minDist, levenshtein(words[i], nameNorm));
        // windows up to name length
        for (let w = 1; w <= windowSize && i + w <= words.length; w++) {
          const seg = words.slice(i, i + w).join(' ');
          minDist = Math.min(minDist, levenshtein(seg, nameNorm));
        }
      }

      // choose a threshold: allow up to ~25% of name length as edits (min 1)
      const thresh = nameNorm.length <= 4 ? 1 : Math.ceil(nameNorm.length * 0.25);
      if (minDist <= thresh) return f;
    }

    return null;
  };

  // Extract quantity from text (e.g., "add 5 flowers")
  const extractQuantity = (text: string): number => {
    const match = text.match(/\b(\d+)\b/);
    return match ? parseInt(match[1], 10) : 1;
  };

  async function send() {
    if (!input?.trim()) return;
    const userMsg: Msg = { id: String(Date.now()), sender: 'user', text: input.trim() };
    // push user message immediately
    setMsgs((s: Msg[]) => [userMsg, ...s]);
    setInput('');

    // intent detection based on user's message
    const textLower = userMsg.text.toLowerCase();
    const isDirectAdd = /(?:add).*(?:cart)|thêm.*(?:giỏ|cart)|add.*to.*cart|thêm\s+hoa|thêm\s+vào\s+giỏ/i.test(textLower);
    const isThankYou = /(^|\b)(thank you|thanks|tnx|thx|cảm ơn|cam on)(\b|!|\.|,)?/i.test(textLower);
    const isAffirm = /(^|\b)(yes|ok|okay|sure|đồng ý|được|có|đồngy)(\b|!|\.|,)?/i.test(textLower);

    // 1) If user directly asks to add to cart
    if (isDirectAdd) {
      // try to extract flower from user's message first, otherwise use last AI suggestion
      let flower = findFlowerInText(userMsg.text);
      if (!flower) {
        const lastAi = msgs.find((m) => m.sender === 'ai');
        flower = findFlowerInText(lastAi?.text || '');
      }

      if (flower) {
        // if flower has stock info, check before asking quantity
        if (typeof flower.stock === 'number' && flower.stock <= 0) {
          const aiMsg: Msg = { 
            id: String(Date.now() + 5), 
            sender: 'ai', 
            text: `Sorry, ${flower.name} is out of stock.` 
          };
          setMsgs((s) => [aiMsg, ...s]);
          Alert.alert('Out of Stock', `${flower.name} is currently out of stock.`);
          return;
        }

        // Get quantity from message or ask via Alert
        const requestedQty = extractQuantity(userMsg.text);
        const stockInfo = typeof flower.stock === 'number' 
          ? `(${flower.stock} in stock)` 
          : '';

        // Show quantity dialog with stock-based options
        const maxStock = typeof flower.stock === 'number' ? flower.stock : 10;
        const buttons: any[] = [{ text: 'Cancel', style: 'cancel' }];
        
        // Add quantity options based on available stock
        [1, 2, 5, 10].forEach(qty => {
          if (qty <= maxStock) {
            buttons.push({ 
              text: String(qty), 
              onPress: () => addToCartWithQty(flower, qty) 
            });
          }
        });

        Alert.alert(
          'Select Quantity',
          `How many ${flower.name} would you like to add? ${stockInfo}\n\nSelect quantity:`,
          buttons
        );
        return;
      }
      // fallback: let AI respond if we couldn't identify a flower
    }

    // 2) If user says thank you, propose to add the last suggested flower
    if (isThankYou) {
      const lastAi = msgs.find((m) => m.sender === 'ai');
      const suggested = findFlowerInText(lastAi?.text || '');
      if (suggested) {
        // Check stock before suggesting
        const stockInfo = typeof suggested.stock === 'number' 
          ? ` (${suggested.stock} in stock)` 
          : '';
        
        // set pending suggestion and ask for quantity
        setPendingSuggestion({ product: suggested, qty: 1 });
        const aiMsg: Msg = { 
          id: String(Date.now() + 3), 
          sender: 'ai', 
          text: `Thank you! I can add ${suggested.name}${stockInfo} to your cart. Type "yes" to confirm.` 
        };
        setMsgs((s) => [aiMsg, ...s]);
        return;
      }
      // if no suggestion found, continue to call AI
    }

    // 3) If user affirms and we have a pending suggestion, prompt for quantity
    if (isAffirm && pendingSuggestion) {
      const flower = pendingSuggestion.product;
      
      // check stock before asking quantity
      if (typeof flower.stock === 'number' && flower.stock <= 0) {
        const aiMsg: Msg = { 
          id: String(Date.now() + 4), 
          sender: 'ai', 
          text: `Sorry, ${flower.name} is out of stock.` 
        };
        setMsgs((s) => [aiMsg, ...s]);
        Alert.alert('Out of Stock', `${flower.name} is currently out of stock.`);
        setPendingSuggestion(null);
        return;
      }

      const stockInfo = typeof flower.stock === 'number' 
        ? `(${flower.stock} in stock)` 
        : '';

      // Show quantity dialog with stock-based options
      const maxStock = typeof flower.stock === 'number' ? flower.stock : 10;
      const buttons: any[] = [
        { text: 'Cancel', style: 'cancel', onPress: () => setPendingSuggestion(null) }
      ];
      
      // Add quantity options based on available stock
      [1, 2, 5, 10].forEach(qty => {
        if (qty <= maxStock) {
          buttons.push({ 
            text: String(qty), 
            onPress: () => {
              addToCartWithQty(flower, qty);
              setPendingSuggestion(null);
            }
          });
        }
      });

      Alert.alert(
        'Select Quantity',
        `How many ${flower.name} would you like to add? ${stockInfo}\n\nSelect quantity:`,
        buttons
      );
      return;
    }

    // default: forward to AI service
    setLoading(true);
    try {
      const text = await aiService.askAI(userMsg.text, flowers, msgs);
      const aiMsg: Msg = { id: String(Date.now() + 1), sender: 'ai', text: text ?? 'No response' };
      setMsgs((s: Msg[]) => [aiMsg, ...s]);
    } catch (err: any) {
      const aiMsg: Msg = { id: String(Date.now() + 2), sender: 'ai', text: `AI Error: ${err?.message ?? 'unknown'}` };
      setMsgs((s: Msg[]) => [aiMsg, ...s]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <TouchableOpacity style={styles.fab} onPress={() => setVisible((v) => !v)}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>AI</Text>
        </TouchableOpacity>
      </View>

      {visible && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.chatWrap}
        >
          <View style={styles.header}>
            <Text style={{ fontWeight: '800' }}>AI Assistant</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Text style={{ color: '#27c16b' }}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={msgs}
            keyExtractor={(it) => it.id}
            inverted
            style={{ flex: 1 }}
            renderItem={({ item }) => (
              <View style={[styles.msgRow, item.sender === 'ai' ? styles.aiMsg : styles.userMsg]}>
                <Text style={{ color: item.sender === 'ai' ? '#000' : '#fff' }}>{item.text}</Text>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask the assistant..."
              style={styles.input}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={send} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>Send</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: { position: 'absolute', right: 18, bottom: 18, zIndex: 999 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#27c16b', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  chatWrap: { position: 'absolute', right: 12, bottom: 88, left: 12, top: 80, backgroundColor: '#fff', borderRadius: 12, padding: 8, elevation: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderColor: '#f0f0f0' },
  inputRow: { flexDirection: 'row', padding: 8, gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 8, height: 40 },
  sendBtn: { backgroundColor: '#27c16b', paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  msgRow: { marginVertical: 6, padding: 10, borderRadius: 12, maxWidth: '80%' },
  aiMsg: { backgroundColor: '#f0f4f2', alignSelf: 'flex-start' },
  userMsg: { backgroundColor: '#27c16b', alignSelf: 'flex-end' },
});