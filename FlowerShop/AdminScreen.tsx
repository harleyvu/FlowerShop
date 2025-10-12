import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👑 Welcome Admin!</Text>
      <Text style={styles.subtext}>Manage users, orders, and reports here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF7FA' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#FF69B4' },
  subtext: { marginTop: 10, color: '#777' },
});
