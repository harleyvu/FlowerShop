import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SellerScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌸 Hello Seller!</Text>
      <Text style={styles.subtext}>Manage your flower listings and sales here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0FFF0' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
  subtext: { marginTop: 10, color: '#555' },
});
