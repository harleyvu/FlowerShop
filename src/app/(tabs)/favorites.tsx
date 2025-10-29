import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import ProductCard from '../../components/ProductCard';
import { useFavorites } from '../../contexts/FavoritesContext';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();

  return (
    <View style={styles.container}>
      
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ProductCard product={item} />
          </View>
        )}
        keyExtractor={(item) => String(item.id || item.productId || item._id)}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 8,
  },
  cardContainer: {
    flex: 1,
    maxWidth: '50%',
  },
});