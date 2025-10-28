import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal, // +++
  ScrollView, // +++
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getFlowers, getFlowersByCategory } from "../../api/apiClient";
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
  disabled: "#d0ddd5",
};

export default function ShopScreen() {
  const [data, setData] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const router = useRouter();

  // +++ Filter UI states
  const [showFilter, setShowFilter] = useState(false);
  const [uiPriceIndex, setUiPriceIndex] = useState(3);
  const [uiCategory, setUiCategory] = useState<number | null>(null);

  // +++ Nhận params từ route: category (sẽ load filtered) và openFilter
  const params = useLocalSearchParams<{ category?: string; openFilter?: string }>();
  useEffect(() => {
    if (params?.openFilter) setShowFilter(true);
  }, [params?.openFilter]);

  // Unified loader: if category provided -> call getFlowersByCategory
  const load = async (category?: number | null, signal?: AbortSignal) => {
    try {
      setError(null);
      setLoading(true);
      let flowers: Flower[] = [];
      if (typeof category === "number" && !isNaN(category)) {
        flowers = await getFlowersByCategory(category, signal);
        setUiCategory(category);
      } else {
        flowers = await getFlowers(signal);
        setUiCategory(null);
      }
      setData(flowers);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    const catParam = params?.category ? Number(params.category) : null;
    load(catParam, ac.signal);
    return () => ac.abort();
  }, [params?.category]);

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

  // ADD: Apply -> call API filtered by category; Reset -> reload all
  const applyFilter = async () => {
    try {
      setShowFilter(false);
      setLoading(true);
      setError(null);
      const ac = new AbortController();

      let flowers;
      if (uiCategory != null) {
        flowers = await getFlowersByCategory(uiCategory, ac.signal);
      } else {
        flowers = await getFlowers(ac.signal);
      }
      setData(flowers);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = async () => {
    setUiCategory(null);
    setUiPriceIndex(3);
    try {
      setShowFilter(false);
      setLoading(true);
      setError(null);
      const ac = new AbortController();
      const flowers = await getFlowers(ac.signal);
      setData(flowers);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
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

      {/* Search + Filter */}
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
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <Image source={require("../../assets/filter.png")} style={styles.filterIcon} />
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
              router.push({
                pathname: "/product/[id]",
                params: { id: String(item.id) },
              } as any)
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
      {/* AI chat bubble */}
      <AIChatBubble flowers={data} />

      {/* ===== FILTER MODAL — UI ONLY (Price + Category) ===== */}
      <Modal visible={showFilter} animationType="slide" onRequestClose={() => setShowFilter(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
          {/* Modal header — only close button */}
          <View style={styles.modalCloseHeader}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowFilter(false)}>
              <Ionicons name="close" size={20} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.sortBy}>Sort By</Text>

            {/* Price */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.dotGreen} />
                <Text style={styles.sectionTitle}>Price</Text>
              </View>

              {/* Fake histogram + track + knob (UI only) */}
              <View style={styles.histogramRow}>
                {[14, 26, 38, 30, 44].map((h, i) => (
                  <View key={i} style={[styles.bar, { height: h }]} />
                ))}
                <View style={styles.track} />
                <View style={[styles.knob, { left: `${uiPriceIndex * 33.33}%` }]} />
              </View>

              {/* Steps */}
              <View style={styles.chipsRow}>
                {["15$", "50$", "150$", "1000$"].map((t, i) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setUiPriceIndex(i)}
                    style={[styles.chip, uiPriceIndex === i && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, uiPriceIndex === i && styles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.dotGreen} />
                <Text style={styles.sectionTitle}>Category</Text>
              </View>

              <View style={styles.catGrid}>
                {CATEGORY_OPTIONS.map((c) => {
                  const active = uiCategory === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.catItem, active && styles.catItemActive]}
                      onPress={() => setUiCategory(active ? null : c.id)}
                    >
                      <Image source={{ uri: c.image }} style={styles.catImg} />
                      <Text style={styles.catName} numberOfLines={1}>{c.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: "#eaf6ef" }]}
              onPress={resetFilter}
            >
              <Text style={[styles.footerText, { color: COLORS.primary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerBtn, { backgroundColor: COLORS.primary }]}
              onPress={applyFilter}
            >
              <Text style={[styles.footerText, { color: "#fff" }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function ProductCard({ item }: { item: Flower }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const priceText = useMemo(
    () => `${item.price.toLocaleString("vi-VN")} VND`,
    [item.price]
  );

  const validImage = item.imageUrl?.startsWith("http");
  const isOutOfStock = item.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Alert.alert(
        "Out of Stock",
        `${item.name} is currently out of stock. Please check back later.`,
        [{ text: "OK" }]
      );
      return;
    }

    addToCart(
      { productId: String(item.id), name: item.name, price: item.price },
      1
    );
    Alert.alert(
      "Added to cart",
      `${item.name} has been added to your cart.`,
      [
        {
          text: "View cart",
          onPress: () => router.push({ pathname: "/(tabs)/cart" } as any),
        },
        { text: "Continue", style: "cancel" },
      ]
    );
  };

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
        <Text style={[styles.stock, isOutOfStock && styles.outOfStock]}>
          {isOutOfStock ? "Out of stock" : `Stock: ${item.stock}`}
        </Text>

        <TouchableOpacity
          style={[styles.addBtn, isOutOfStock && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <Text style={[styles.addText, isOutOfStock && styles.addTextDisabled]}>
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// +++ Category mock for UI
const CATEGORY_OPTIONS = [
  { id: 1, name: "Roses", image: "https://images.unsplash.com/photo-1509043759401-136742328bb3?w=200" },
  { id: 5, name: "Orchids", image: "https://images.unsplash.com/photo-1468824357306-a439d58ccb1c?w=200" },
  { id: 2, name: "Tulips", image: "https://images.unsplash.com/photo-1464965911892-8a99f4a06e0b?w=200" },
  { id: 4, name: "Lilies", image: "https://images.unsplash.com/photo-1504198266285-165a3c76e0d3?w=200" },
  { id: 6, name: "Sunflowers", image: "https://images.unsplash.com/photo-1502989642968-94fbdc9eace4?w=200" },
  { id: 7, name: "Carnations", image: "https://images.unsplash.com/photo-1544551763-7ef4200b69c3?w=200" },
  { id: 8, name: "Mixed", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200" },
  { id: 3, name: "Daisies", image: "https://images.unsplash.com/photo-1520975937573-5f7f4f0b4c04?w=200" },
];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.bg },

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
  headerIcon: { width: 20, height: 20, tintColor: COLORS.dark },

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
  filterIcon: { width: 18, height: 18, tintColor: COLORS.card },

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
  stock: { color: COLORS.sub, fontSize: 12, marginTop: 2 },
  outOfStock: { color: "#e74c3c", fontWeight: "600" },

  addBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  addBtnDisabled: {
    backgroundColor: COLORS.disabled,
  },
  addText: { color: "#fff", fontWeight: "700" },

  // ===== Modal styles =====
  fHeader: {
    paddingHorizontal: 14, paddingBottom: 6,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sortBy: { paddingHorizontal: 14, color: COLORS.text, fontWeight: "800", marginBottom: 6 },
  section: {
    backgroundColor: COLORS.card, marginHorizontal: 14, marginBottom: 12,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, padding: 12,
  },
  sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  dotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  sectionTitle: { fontWeight: "800", color: COLORS.text },

  histogramRow: { position: "relative", height: 50, marginVertical: 8, flexDirection: "row", alignItems: "flex-end", gap: 6 },
  bar: { width: 22, backgroundColor: "#dff2e7", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  track: { position: "absolute", left: 0, right: 0, bottom: 2, height: 4, backgroundColor: "#cde8da", borderRadius: 2 },
  knob: { position: "absolute", bottom: -4, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.primary, transform: [{ translateX: -8 }] },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.bg },
  chipActive: { borderColor: COLORS.primary, backgroundColor: "#e9f5ef" },
  chipText: { color: COLORS.sub, fontWeight: "600" },
  chipTextActive: { color: COLORS.dark },

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catItem: { width: 74, alignItems: "center", padding: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  catItemActive: { borderColor: COLORS.primary, backgroundColor: "#e9f5ef" },
  catImg: { width: 40, height: 40, borderRadius: 20, marginBottom: 6 },
  catName: { fontSize: 12, color: COLORS.text },

  footerActions: { flexDirection: "row", gap: 10, padding: 14, backgroundColor: COLORS.bg, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  footerText: { fontWeight: "700" },

  // modal close header (right aligned X)
  modalCloseHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});