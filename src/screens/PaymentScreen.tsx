import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

export default function PaymentScreen({ route, navigation }: any) {
  const { order } = route.params;
  const [selectedMethod, setSelectedMethod] = useState<number | null>(1); // 1: COD
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Warning', 'Please select a payment method.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5098/api/Payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          method: selectedMethod,
          amount: order.total,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed.');
      }

      Alert.alert(
        'Success',
        `Payment successful!\nMethod: ${getPaymentMethod(
          selectedMethod
        )}\nAmount: $${order.total.toFixed(2)}`,
        [{ text: 'OK', onPress: () => navigation.navigate('MyOrdersScreen') }]
      );
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      Alert.alert('Error', error.message || 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethod = (method: number) => {
    switch (method) {
      case 1:
        return 'Cash On Delivery';
      case 2:
        return 'Credit Card';
      case 3:
        return 'Bank Transfer';
      default:
        return 'Other';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment for Order #{order.id}</Text>
      <Text style={styles.amount}>Total: ${order.total.toFixed(2)}</Text>

      <View style={styles.methodContainer}>
        <Text style={styles.label}>Select Payment Method:</Text>

        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 1 && styles.selectedButton,
          ]}
          onPress={() => setSelectedMethod(1)}
        >
          <Text
            style={[
              styles.methodText,
              selectedMethod === 1 && styles.selectedText,
            ]}
          >
            Cash On Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 2 && styles.selectedButton,
          ]}
          onPress={() => setSelectedMethod(2)}
        >
          <Text
            style={[
              styles.methodText,
              selectedMethod === 2 && styles.selectedText,
            ]}
          >
            Credit Card
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.methodButton,
            selectedMethod === 3 && styles.selectedButton,
          ]}
          onPress={() => setSelectedMethod(3)}
        >
          <Text
            style={[
              styles.methodText,
              selectedMethod === 3 && styles.selectedText,
            ]}
          >
            Bank Transfer
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E91E63" />
      ) : (
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={loading}
        >
          <Text style={styles.payText}>Confirm Payment</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FA', padding: 20 },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C2185B',
    marginBottom: 10,
    textAlign: 'center',
  },
  amount: { fontSize: 18, color: '#E91E63', textAlign: 'center', marginBottom: 20 },
  methodContainer: { marginBottom: 20 },
  label: { fontWeight: 'bold', color: '#555', marginBottom: 10 },
  methodButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E91E63',
    borderRadius: 12,
    marginVertical: 6,
  },
  selectedButton: {
    backgroundColor: '#E91E63',
  },
  methodText: { textAlign: 'center', color: '#E91E63', fontWeight: '500' },
  selectedText: { color: '#FFF', fontWeight: 'bold' },
  payButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  payText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFB6C1',
    borderRadius: 25,
  },
  backText: { color: '#FFF', fontWeight: 'bold' },
});
