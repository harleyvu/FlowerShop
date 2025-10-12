import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

export default function ShopScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://springflowers.store/cdn/shop/files/SPRING_LOGO.png?v=1707224320' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.brand}>Spring Flowers</Text>
      </View>

      <Text style={styles.title}>🌸 Featured Flowers</Text>

      <View style={styles.card}>
        <Image 
          source={{ uri: 'https://springflowers.store/cdn/shop/files/1706945570-1651051385-hoa-sen.jpg?v=1706945601&width=500' }}
          style={styles.image}
        />
        <Text style={styles.name}>Lotus Blossom</Text>
        <Text style={styles.price}>$25.00</Text>
        <TouchableOpacity style={styles.buyBtn}>
          <Text style={styles.buyText}>Buy Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FA', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logo: { width: 60, height: 40, marginRight: 10 },
  brand: { fontSize: 20, fontWeight: 'bold', color: '#FF69B4' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 20,
  },
  image: { width: '100%', height: 200, borderRadius: 15 },
  name: { fontSize: 18, fontWeight: '600', marginTop: 10 },
  price: { fontSize: 16, color: '#888', marginVertical: 5 },
  buyBtn: {
    backgroundColor: '#FF69B4',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  buyText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
