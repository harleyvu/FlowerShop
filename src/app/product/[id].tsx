import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFlowerById } from '../../api/apiClient';
import { useCart } from '../../contexts/CartContext';
import type { Flower } from '../../types/flower';

const COLORS = {
  primary: '#27c16b',
  dark: '#1f7a4c',
  text: '#203a2f',
  sub: '#6b8f80',
  bg: '#f6faf7',
  card: '#ffffff',
  border: '#e6eee9',
};

export default function ProductDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Flower | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    const ac = new AbortController();
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await getFlowerById(id, ac.signal);
        setProduct(data);
      } catch (err: any) {
        setError(err.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
    return () => ac.abort();
  }, [id]);

  const priceText = useMemo(() => {
    const p = product?.price ?? 0;
    return `${p.toLocaleString('en-US')} VND`;
  }, [product]);

  const hasImage = product?.imageUrl && product.imageUrl.startsWith('http');

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: 'red', marginBottom: 12 }}>{error || "Product not found."}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.addBtn}>
          <Text style={styles.addText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.dark} />
        </TouchableOpacity>
        <Text style={styles.brand}>Flowerfly</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Image */}
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          {hasImage ? (
            <Image source={{ uri: product.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Text style={{ color: COLORS.sub }}>No image</Text>
            </View>
          )}
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.title} numberOfLines={2}>{product.name || 'No name'}</Text>

          <Text style={styles.sectionLabel}>Composition:</Text>
          <Text style={styles.desc} numberOfLines={4}>{product.description || 'Updating...'}</Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
              <Ionicons name="remove" size={18} color={COLORS.dark} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => q + 1)}>
              <Ionicons name="add" size={18} color={COLORS.dark} />
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>{priceText}</Text>

          <TouchableOpacity style={styles.addBtn} onPress={() => {
            addToCart({ productId: String(product.id), name: product.name, price: product.price }, qty);
            Alert.alert('Added to cart', `${product.name} has been added to your cart`, [
              { text: 'Continue shopping', style: 'cancel' },
              { text: 'View cart', onPress: () => router.push({ pathname: '/(tabs)/cart' } as any) },
            ]);
          }}>
            <Text style={styles.addText}>Add to cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { fontSize: 24, color: COLORS.dark, fontFamily: 'Pacifico-Regular' },
  image: { width: 240, height: 200, resizeMode: 'contain' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f2', borderRadius: 8 },
  card: { marginTop: 16, marginHorizontal: 12, padding: 16, borderRadius: 18, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  sectionLabel: { marginTop: 8, fontWeight: '700', color: COLORS.text },
  desc: { color: COLORS.sub, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 18 },
  qtyBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  price: { marginTop: 12, fontSize: 22, fontWeight: '800', color: COLORS.dark },
  addBtn: { marginTop: 12, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 24, alignItems: 'center' },
  addText: { color: '#fff', fontWeight: '700' },
});