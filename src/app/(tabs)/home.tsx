// src/app/home.tsx
// Flowerfly Home UI — no external libs required
// Paste this file at: src/app/home.tsx
// Replace placeholder images (banner/category/product) with your assets

import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ============ COLORS / THEME ============
const COLORS = {
  primary: "#27c16b",
  dark: "#1f7a4c",
  text: "#203a2f",
  sub: "#6b8f80",
  bg: "#f6faf7",
  card: "#ffffff",
  border: "#e6eee9",
};

// ============ TYPES ============
export type Product = {
  id: string | number;
  name: string;
  price: number;
  image: string; // remote uri or require local via Image.resolveAssetSource
};

export type Category = {
  id: string | number;
  name: string;
  image: string;
};

// ============ MOCK DATA (replace with API later) ============
const BANNERS: string[] = [
  // TODO: replace with your banner images
  "https://images.unsplash.com/photo-1495294474051-fff1e52bf80d?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1493340775710-2f33f4f6f56b?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1491002052546-bf38f186af2e?q=80&w=1600&auto=format&fit=crop",
];

const CATEGORIES: Category[] = [
  { id: 1, name: "for Wedding", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400" },
  { id: 2, name: "Flowers in box", image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400" },
  { id: 3, name: "for Birthday", image: "https://images.unsplash.com/photo-1504198266285-165a3c76e0d3?w=400" },
  { id: 4, name: "Roses", image: "https://images.unsplash.com/photo-1509043759401-136742328bb3?w=400" },
  { id: 5, name: "Tulips", image: "https://images.unsplash.com/photo-1464965911892-8a99f4a06e0b?w=400" },
];

const TRENDING: Product[] = [
  { id: 1, name: "101 red roses", price: 150, image: "https://images.unsplash.com/photo-1509043759401-136742328bb3?w=600" },
  { id: 2, name: "Bouquet \"Autumn\"", price: 150, image: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=600" },
  { id: 3, name: "Classic \"Pastel\"", price: 150, image: "https://images.unsplash.com/photo-1447877085163-3cce903855cd?w=600" },
];

const HALLOWEEN: Product[] = [
  { id: 11, name: "Bouquet \"Monster\"", price: 150, image: "https://images.unsplash.com/photo-1500937386664-56f3d8b1a3a1?w=600" },
  { id: 12, name: "Box \"trick or treat\"", price: 150, image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600" },
  { id: 13, name: "Classic \"Pastel\"", price: 150, image: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600" },
];

const { width } = Dimensions.get("window");

export default function Home() {
  const [q, setQ] = useState("");
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef<ScrollView>(null);

  const filteredTrending = useMemo(
    () => TRENDING.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())),
    [q]
  );

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / width);
    setBannerIndex(i);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>Flowerfly</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          {/* Notification button from your Figma component can replace this */}
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.dark} />
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
          <Ionicons name="qr-code-outline" size={18} color="#7c9b8f" />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="settings-outline" size={18} color={COLORS.card} />
        </TouchableOpacity>
      </View>

      {/* Special Offers (carousel) */}
      <SectionHeader title="Special Offers" onPressViewAll={() => {}} />
      <View style={styles.bannerWrap}>
        <ScrollView
          ref={bannerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onBannerScroll}
          scrollEventThrottle={16}
        >
          {BANNERS.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.banner} />
          ))}
        </ScrollView>
        <Dots activeIndex={bannerIndex} length={BANNERS.length} />
        <View style={styles.saleBadge}>
          <Text style={styles.saleText}>Sale{"\n"}30% off</Text>
        </View>
      </View>

      {/* Categories */}
      <SectionHeader title="Categories" onPressViewAll={() => {}} />
      <FlatList
        horizontal
        data={CATEGORIES}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <CategoryPill name={item.name} image={item.image} onPress={() => {}} />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
        style={{ marginBottom: 10 }}
      />

      {/* Trends & Popular now */}
      <SectionHeader title="Trends & Popular now" onPressViewAll={() => {}} />
      <FlatList
        horizontal
        data={filteredTrending}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => <ProductCardSmall item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
        style={{ marginBottom: 16 }}
      />

      {/* Halloween theme */}
      <SectionHeader title="Halloween theme" onPressViewAll={() => {}} withDot />
      <FlatList
        horizontal
        data={HALLOWEEN}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => <ProductCardSmall item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
        style={{ marginBottom: 16 }}
      />

      {/* Upcoming events banner */}
      <SectionHeader title="Upcoming events" />
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1600" }}
        style={styles.upcoming}
      />
      <View style={{ position: "relative", marginTop: -68, paddingHorizontal: 18 }}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", textShadowColor: "#0006", textShadowRadius: 8 }}>
          Magic Christmas
        </Text>
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600", textShadowColor: "#0006", textShadowRadius: 8 }}>
          coming soon
        </Text>
      </View>
    </ScrollView>
  );
}

// ============ Subcomponents ============
function SectionHeader({ title, onPressViewAll, withDot }: { title: string; onPressViewAll?: () => void; withDot?: boolean }) {
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

function Dots({ activeIndex, length }: { activeIndex: number; length: number }) {
  return (
    <View style={styles.dotsWrap}>
      {Array.from({ length }).map((_, i) => (
        <View key={i} style={[styles.dotSmall, i === activeIndex && styles.dotSmallActive]} />
      ))}
    </View>
  );
}

function CategoryPill({ name, image, onPress }: { name: string; image: string; onPress?: () => void }) {
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

// ============ Styles ============
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { fontSize: 28, fontWeight: "800", color: COLORS.dark },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e9f5ef",
    alignItems: "center",
    justifyContent: "center",
  },
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
  sectionHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  viewAll: { color: COLORS.dark, fontWeight: "700" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 2 },
  bannerWrap: { position: "relative" },
  banner: { width, height: 160 },
  dotsWrap: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dotSmall: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ffffff88" },
  dotSmallActive: { backgroundColor: "#fff" },
  saleBadge: {
    position: "absolute",
    right: 14,
    top: 14,
    backgroundColor: "#ffffffd9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saleText: { color: COLORS.primary, fontWeight: "800", textAlign: "center" },
  catPill: {
    width: 100,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: "center",
    gap: 6,
  },
  catImage: { width: 54, height: 54, borderRadius: 27 },
  catText: { fontSize: 12, textAlign: "center", color: COLORS.text },
  productCard: {
    width: 160,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
  },
  productImg: { width: "100%", height: 90, borderRadius: 10, marginBottom: 6 },
  productName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  productPrice: { marginTop: 4, color: COLORS.primary, fontWeight: "800" },
  upcoming: { width: width - 28, height: 180, marginHorizontal: 14, borderRadius: 16 },
});
