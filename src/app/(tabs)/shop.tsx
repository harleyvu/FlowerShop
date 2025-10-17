import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductCard from "../../components/ProductCard";
import type { Product } from "../../types/flowers";

// COLORS giống home.tsx
const COLORS = {
  primary: "#27c16b",
  dark: "#1f7a4c",
  text: "#203a2f",
  sub: "#6b8f80",
  bg: "#f6faf7",
  card: "#ffffff",
  border: "#e6eee9",
};

// Dữ liệu giả
const PRODUCTS: Product[] = [
  { id: 1, name: "Bouquet 'Autumn'", price: 150, image: "https://i.pinimg.com/564x/2b/36/19/2b361932f6833c3a3c93b83322b76716.jpg", typeId: 1, colorKey: "RED" },
  { id: 2, name: "Spring Delight", price: 120, image: "https://i.pinimg.com/564x/9a/a6/5c/9aa65c60345a9935129b1a44919a1b7c.jpg", typeId: 2, colorKey: "PINK" },
  { id: 3, name: "Sunny Morning", price: 90, image: "https://i.pinimg.com/564x/5a/8c/f1/5a8cf1ecb6a85bad733a0c17a12371dc.jpg", typeId: 6 },
  { id: 4, name: "Purple Rain", price: 200, image: "https://i.pinimg.com/564x/b8/a2/32/b8a23245bab6f842a27a7a6277187c4b.jpg", typeId: 5 },
  { id: 5, name: "Winter Kiss", price: 180, image: "https://i.pinimg.com/564x/8e/71/41/8e71412280b239a31c52223a233d2a2f.jpg", typeId: 8 },
  { id: 6, name: "Golden Fields", price: 95, image: "https://i.pinimg.com/564x/f0/b4/2c/f0b42c39334549962f3a0298953d54a2.jpg", typeId: 3, colorKey: "YELLOW" },
];

export default function ShopScreen() {
  const [q, setQ] = useState("");

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
        data={PRODUCTS}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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

  gridContainer: { paddingHorizontal: 8 },
});