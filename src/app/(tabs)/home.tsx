import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState, useMemo } from "react";
import {
  Alert, Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import BannerCarousel from "../../components/BannerCarousel";
import { useCart } from '../../contexts/CartContext';
import { getFlowersByCategory } from "../../api/apiClient";
import type { Flower } from "../../types/flower";

const COLORS = {
  primary: "#27c16b",
  dark: "#1f7a4c",
  text: "#203a2f",
  sub: "#6b8f80",
  bg: "#f6faf7",
  card: "#ffffff",
  border: "#e6eee9",
};

export type Product = { id: string | number; name: string; price: number; image: string; };
export type Category = { id: string | number; name: string; image: string; };

const BANNERS: string[] = [
  "https://plus.unsplash.com/premium_photo-1677005708723-c0dabb815e4b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387",
  "https://plus.unsplash.com/premium_photo-1661292066962-48e5815dc7ce?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870",
  "https://images.unsplash.com/photo-1589244159943-460088ed5c92?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=890",
];



const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const { items } = useCart();
  const [pendingCartNotify, setPendingCartNotify] = useState(false);
  const [roses, setRoses] = useState<Flower[]>([]);
  const [tulips, setTulips] = useState<Flower[]>([]);
  const [lilies, setLilies] = useState<Flower[]>([]);

  // category UI copied from shop
  const [uiCategory, setUiCategory] = useState<number | null>(null);
  // khi bấm lên 1 loài: set active UI và chuyển sang shop với param category
  const onSelectCategory = (id: number) => {
    setUiCategory((prev) => (prev === id ? null : id));
    router.push({ pathname: "/(tabs)/shop", params: { category: String(id) } } as any);
  };

  // load roses (category = 1) to show as horizontal carousel on Home
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await getFlowersByCategory(1, ac.signal);
        setRoses(res ?? []);
      } catch {
        setRoses([]);
      }
    })();
    return () => ac.abort();
  }, []);

  // load Tulips (category = 2)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await getFlowersByCategory(2, ac.signal);
        setTulips(res ?? []);
      } catch {
        setTulips([]);
      }
    })();
    return () => ac.abort();
  }, []);

  // load Lilies (category = 4)
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await getFlowersByCategory(4, ac.signal);
        setLilies(res ?? []);
      } catch {
        setLilies([]);
      }
    })();
    return () => ac.abort();
  }, []);

  // On mount, check if we should show cart notification set during login
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const flag = await AsyncStorage.getItem('SHOW_CART_NOTIFICATION');
        if (!mounted) return;
        if (flag === '1') {
          // clear the flag and wait for items to be available
          await AsyncStorage.removeItem('SHOW_CART_NOTIFICATION');
          setPendingCartNotify(true);
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // When cart items are loaded and we have a pending notification, show it
  useEffect(() => {
    if (!pendingCartNotify) return;
    if (!items) return;
    if (items.length > 0) {
      Alert.alert(
        'You have items in your cart',
        `You have ${items.length} item${items.length > 1 ? 's' : ''} in your cart. Would you like to view your cart now?`,
        [
          { text: 'View cart', onPress: () => router.replace('/(tabs)/cart') },
          { text: 'Continue', style: 'cancel' },
        ]
      );
    }
    setPendingCartNotify(false);
  }, [pendingCartNotify, items, router]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 36 }} />
          <Text style={styles.brand}>Flowerfly</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={styles.iconBtn}>
              <Image source={require('../../assets/notification.png')} style={styles.headerIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ĐÃ BỎ thanh Search + Filter */}

        {/* Banner carousel */}
        <BannerCarousel images={BANNERS} height={180} borderRadius={16} autoplay />

        {/* Categories (horizontal single row) */}
        <SectionHeader title="Category" />
        <FlatList
          horizontal
          data={CATEGORY_OPTIONS}
          keyExtractor={(c) => String(c.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 10, alignItems: "center" }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => {
            const active = uiCategory === item.id;
            return (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onSelectCategory(item.id)}
                style={[styles.catPillLarge, active && styles.catPillLargeActive]}
              >
                <Image source={{ uri: item.image }} style={styles.catPillLargeImg} />
                <Text numberOfLines={1} style={[styles.catPillLargeText, active && styles.catPillLargeTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />

        {/* Roses (category=1) — horizontal list loaded from API, same logic as Shop */}
        <SectionHeader
          title="Roses"
          onPressViewAll={() =>
            router.push({ pathname: "/(tabs)/shop", params: { category: "1" } } as any)
          }
        />
        <FlatList
          horizontal
          data={roses}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: String(item.id) },
                } as any)
              }
              style={{ marginRight: 12 }}
            >
              <HomeFlowerCard item={item} />
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          style={{ marginBottom: 16 }}
        />

        {/* Tulips (category=2) */}
        <SectionHeader
          title="Tulips"
          onPressViewAll={() =>
            router.push({ pathname: "/(tabs)/shop", params: { category: "2" } } as any)
          }
        />
        <FlatList
          horizontal
          data={tulips}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: String(item.id) },
                } as any)
              }
              style={{ marginRight: 12 }}
            >
              <HomeFlowerCard item={item} />
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          style={{ marginBottom: 16 }}
        />

        {/* Lilies (category=4) */}
        <SectionHeader
          title="Lilies"
          onPressViewAll={() =>
            router.push({ pathname: "/(tabs)/shop", params: { category: "4" } } as any)
          }
        />
        <FlatList
          horizontal
          data={lilies}
          keyExtractor={(it) => String(it.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                router.push({
                  pathname: "/product/[id]",
                  params: { id: String(item.id) },
                } as any)
              }
              style={{ marginRight: 12 }}
            >
              <HomeFlowerCard item={item} />
            </TouchableOpacity>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          style={{ marginBottom: 16 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onPressViewAll, withDot }: { title: string; onPressViewAll?: () => void; withDot?: boolean; }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {withDot && <View style={styles.dot} />}
      </View>
      {onPressViewAll && (
        <TouchableOpacity onPress={onPressViewAll}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function CategoryPill({ name, image, onPress }: { name: string; image: string; onPress?: () => void; }) {
  return (
    <TouchableOpacity style={styles.catPill} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: image }} style={styles.catImage} />
      <Text numberOfLines={2} style={styles.catText}>{name}</Text>
    </TouchableOpacity>
  );
}

function ProductCardSmall({ item }: { item: Product }) {
  return (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImg} />
      <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>$ {item.price}</Text>
    </View>
  );
}

// Home horizontal flower card (mirrors Shop ProductCard behaviour in compact form)
function HomeFlowerCard({ item }: { item: Flower }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const priceText = useMemo(() => `${item.price.toLocaleString("vi-VN")} VND`, [item.price]);
  const validImage = item.imageUrl?.startsWith("http");
  const isOutOfStock = item.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      Alert.alert("Out of Stock", `${item.name} is currently out of stock.`, [{ text: "OK" }]);
      return;
    }
    addToCart({ productId: String(item.id), name: item.name, price: item.price }, 1);
    Alert.alert("Added to cart", `${item.name} has been added to your cart.`, [
      { text: "View cart", onPress: () => router.push({ pathname: "/(tabs)/cart" } as any) },
      { text: "Continue", style: "cancel" },
    ]);
  };

  return (
    <View style={[styles.productCard, { width: 200 }]}>
      {validImage ? (
        <Image source={{ uri: item.imageUrl }} style={[styles.productImg, { height: 110 }]} />
      ) : (
        <View style={[styles.productImg, styles.imagePlaceholder]}>
          <Text style={{ color: COLORS.sub, fontSize: 12 }}>No image</Text>
        </View>
      )}
      <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
      <Text numberOfLines={1} style={{ color: COLORS.sub, fontSize: 12 }}>{item.description}</Text>
      <Text style={styles.productPrice}>{priceText}</Text>
      <TouchableOpacity
        style={[styles.addBtn, { borderRadius: 12, marginTop: 8 }]}
        onPress={handleAddToCart}
        disabled={isOutOfStock}
      >
        <Text style={styles.addText}>{isOutOfStock ? "Out of stock" : "Add to cart"}</Text>
      </TouchableOpacity>
    </View>
  );
}

// category mock (copied from shop)
const CATEGORY_OPTIONS = [
  { id: 1, name: "Roses", image: "https://images.unsplash.com/photo-1578439231583-9eca0a363860?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=387" },
  { id: 5, name: "Orchids", image: "https://images.unsplash.com/photo-1605996370592-b6f7a81e382e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=435" },
  { id: 2, name: "Tulips", image: "https://plus.unsplash.com/premium_photo-1661427503852-5e2700754174?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170" },
  { id: 4, name: "Lilies", image: "https://images.unsplash.com/photo-1561897519-6e4fbd1fbc41?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687" },
  { id: 6, name: "Sunflowers", image: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=735" },
  { id: 7, name: "Carnations", image: "https://images.unsplash.com/photo-1617265178200-facb3f9d8f37?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687" },
  { id: 8, name: "Mixed", image: "https://plus.unsplash.com/premium_photo-1677005250683-f42e33b64d8f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687" },
  { id: 3, name: "Daisies", image: "https://plus.unsplash.com/premium_photo-1667867937010-77fd5161cf8d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1173" },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontFamily: "Pacifico-Regular", fontSize: 32, color: COLORS.dark },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: "#e9f5ef",
    alignItems: "center", justifyContent: "center",
  },
  headerIcon: { width: 20, height: 20, tintColor: COLORS.dark },

  sectionHeader: {
    paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  viewAll: { color: COLORS.dark, fontWeight: "700" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 2 },

  catPill: {
    width: 100, backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 10, alignItems: "center", gap: 6,
  },
  catImage: { width: 54, height: 54, borderRadius: 27 },
  catText: { fontSize: 12, textAlign: "center", color: COLORS.text },

  productCard: {
    width: 160, backgroundColor: COLORS.card, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 10,
  },
  productImg: { width: "100%", height: 90, borderRadius: 10, marginBottom: 6 },
  productName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  productPrice: { marginTop: 4, color: COLORS.primary, fontWeight: "800" },

  upcoming: { width: width - 28, height: 180, marginHorizontal: 14, borderRadius: 16 },

  // append these styles to styles object in this file:
  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  catItem: { width: 74, alignItems: "center", padding: 8, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card },
  catItemActive: { borderColor: COLORS.primary, backgroundColor: "#e9f5ef" },
  catImg: { width: 40, height: 40, borderRadius: 20, marginBottom: 6 },
  catName: { fontSize: 12, color: COLORS.text },

  // new styles for single row category pills
  catPillSmall: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  catPillSmallActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#e9f5ef",
  },
  catPillImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
  },
  catPillText: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: "center",
  },
  catPillTextActive: {
    color: COLORS.dark,
    fontWeight: "700",
  },

  // larger horizontal category pills
  catPillLarge: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  catPillLargeActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#e9f5ef",
    shadowOpacity: 0.06,
  },
  catPillLargeImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
  },
  catPillLargeText: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
    width: "100%",
  },
  catPillLargeTextActive: {
    color: COLORS.dark,
    fontWeight: "700",
  },

  // image placeholder style for invalid URLs
  imagePlaceholder: {
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // add to cart button styles
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
