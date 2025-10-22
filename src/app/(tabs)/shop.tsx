import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFlowers } from "../../api/apiClient";
import AIChatBubble from '../../components/AIChatBubble';
import { useCart } from "../../contexts/CartContext";
import { Flower } from "../../types/flower";

const COLORS = {
  primary: "#27c16b",
  dark: "#1f7a4c",
  text: "#203a2f",
  sub: "#6b8f80",
  bg: "#f6faf7",
  card: "#ffffff",
  border: "#e6eee9",
};

export default function ShopScreen() {
  const [data, setData] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const router = useRouter();

  const load = async (signal?: AbortSignal) => {
    try {
      setError(null);
      setLoading(true);
      const flowers = await getFlowers(signal);
      setData(flowers);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "crimson", marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header (copy từ home.tsx) */}
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.brand}>Flowerfly</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={styles.iconBtn}>
            <Image
              source={require("../../assets/notification.png")}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search + Filter (copy từ home.tsx) */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#7c9b8f" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search"
            placeholderTextColor="#7c9b8f"
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Image
            source={require("../../assets/filter.png")}
            style={styles.filterIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <FlatList
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              // cast to any to allow passing params object (expo-router strict types)
              router.push({ pathname: '/product/[id]', params: { id: String(item.id) } } as any)
            }
            style={{ flex: 1 }}
          >
            <ProductCard item={item} />
          </TouchableOpacity>
        )}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        showsVerticalScrollIndicator={false}
      />
      {/* AI chat bubble (floating) */}
      <AIChatBubble flowers={data} />
    </SafeAreaView>
  );
}

function ProductCard({ item }: { item: Flower }) {
  const { addToCart } = useCart();
  const priceText = useMemo(
    () => `${item.price.toLocaleString("vi-VN")} đ`,
    [item.price]
  );

  const validImage = item.imageUrl?.startsWith("http");

  return (
    <View style={styles.card}>
      {validImage ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Text style={{ color: COLORS.sub, fontSize: 12 }}>No image</Text>
        </View>
      )}
      <View style={{ padding: 10 }}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.desc} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.price}>{priceText}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            addToCart({ productId: String(item.id), name: item.name, price: item.price }, 1)
          }
        >
          <Text style={styles.addText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },

  // Header y nguyên home.tsx
  header: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontFamily: "Pacifico-Regular",
    fontSize: 32,
    color: COLORS.dark,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e9f5ef",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.dark,
  },

  // Search y nguyên home.tsx
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  searchBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, color: COLORS.text },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filterIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.card,
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: { width: "100%", height: 120 },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f4f2",
  },
  name: { color: COLORS.text, fontWeight: "700", fontSize: 14 },
  desc: { color: COLORS.sub, fontSize: 12, marginTop: 2 },
  price: { color: COLORS.dark, fontWeight: "800", marginTop: 8 },
  addBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "700" },
});