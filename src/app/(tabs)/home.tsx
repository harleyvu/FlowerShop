import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
  "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1600",
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
  { id: 2, name: 'Bouquet "Autumn"', price: 150, image: "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=600" },
  { id: 3, name: 'Classic "Pastel"', price: 150, image: "https://images.unsplash.com/photo-1447877085163-3cce903855cd?w=600" },
];

const HALLOWEEN: Product[] = [
  { id: 11, name: 'Bouquet "Monster"', price: 150, image: "https://images.unsplash.com/photo-1500937386664-56f3d8b1a3a1?w=600" },
  { id: 12, name: 'Box "trick or treat"', price: 150, image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600" },
  { id: 13, name: 'Classic "Pastel"', price: 150, image: "https://images.unsplash.com/photo-1457089328109-e5d9bd499191?w=600" },
];

const { width } = Dimensions.get("window");

export default function Home() {
  const router = useRouter();
  const { items } = useCart();
  const [pendingCartNotify, setPendingCartNotify] = useState(false);

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

        {/* Categories */}
        <SectionHeader title="Categories" onPressViewAll={() => router.push("/shop")} />
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <CategoryPill name={item.name} image={item.image} onPress={() => router.push("/shop")} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 10 }}
          style={{ marginBottom: 10 }}
        />

        {/* Trends & Popular now */}
        <SectionHeader title="Trends & Popular now" />
        <FlatList
          horizontal
          data={TRENDING}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => <ProductCardSmall item={item} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, gap: 12 }}
          style={{ marginBottom: 16 }}
        />

        {/* Halloween theme */}
        <SectionHeader title="Halloween theme" withDot />
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
});
