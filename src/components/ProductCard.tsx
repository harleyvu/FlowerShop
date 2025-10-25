import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../contexts/CartContext';

type ProductCardProps = {
  product: any;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  const imageUri = product.image || product.imageUrl || product.photo || '';
  const price = product.price ?? product.cost ?? 0;
  const pid = String(product.id ?? product.productId ?? '');

  function handleAdd() {
    addToCart({ productId: pid, name: product.name, price }, qty);
    setQty(1);
    // show action to view checkout or continue
    Alert.alert('Added to cart', `${product.name} has added to cartỏ`, [
      { text: 'Continue buy', style: 'cancel' },
      { text: 'Look at the cart', onPress: () => router.push({ pathname: '/cart' } as any) },
    ]);
  }

  return (
    <View style={styles.card}>
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} /> : null}
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color="#1f7a4c" />
      </TouchableOpacity>

      <View style={styles.info}>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#ffc700" />
          <Text style={styles.ratingText}>4.89</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.price}>$ {price}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity style={styles.counterBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
            <Text style={styles.counterText}>-</Text>
          </TouchableOpacity>
          <Text style={{ marginHorizontal: 8 }}>{qty}</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={() => setQty(q => q + 1)}>
            <Text style={styles.counterText}>+</Text>
          </TouchableOpacity>

          <View style={{ width: 12 }} />

          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Text style={styles.addButtonText}>Add to cart</Text>
            <Ionicons name="cart-outline" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 6,
    borderRadius: 15,
  },
  info: {
    padding: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6b6b6b',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#203a2f',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f7a4c',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#27c16b',
    borderRadius: 20,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 6,
  },
  counterBtn: {
    backgroundColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
  },
});