// App.tsx
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignUpScreen from './src/screens/SignUp';  // 👉 import trang mới
import LoginScreen from './src/screens/Login';  // 👉 import trang mới

import AdminScreen from './src/screens/AdminScreen';
import SellerScreen from './src/screens/SellerScreen';
import CustomerScreen from './src/screens/CustomerScreen';
import MyOrdersScreen from './src/screens/MyOrderScreen';

type RootStackParamList = {
  Home: undefined;
  SignUp: undefined;
  Login: undefined;
  Admin: undefined;
  Seller: undefined;
  Customer: undefined;
  MyOrders: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.title}>CO₂</Text>
        <Text style={styles.subtitle}>VietCarbona</Text>
      </View>

      <View style={styles.box}>
        <Text style={styles.text}>Let's get started</Text>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupBtn}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.btnText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Seller" component={SellerScreen} />
        <Stack.Screen name="Customer" component={CustomerScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7CFC87',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 16, color: 'white' },
  box: {
    backgroundColor: 'white',
    width: '100%',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  text: { fontSize: 18, marginBottom: 15 },
  loginBtn: {
    width: '90%',
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  signupBtn: {
    width: '90%',
    backgroundColor: '#D6F54C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  btnText: { fontSize: 18, fontWeight: 'bold', color: 'black' },
});
