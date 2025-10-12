import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { userService } from '../services/userService';

export default function SignUpScreen({ navigation }: any) {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignUp = async () => {
    const { email, password, confirmPassword, firstName, lastName, address, phoneNumber } = form;

    if (!email || !password || !confirmPassword || !firstName || !lastName || !address) {
      Alert.alert('⚠️ Error', 'Please fill all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('⚠️ Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const userData = {
        username: email.split('@')[0],
        email,
        password,
        phoneNumber,
        firstName,
        lastName,
        address,
      };

      const { ok, data } = await userService.register(userData);

      if (ok) {
        Alert.alert('✅ Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('❌ Error', data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ SignUp error:', error);
      Alert.alert('Error', 'Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={{ uri: 'https://springflowers.store/cdn/shop/files/SPRING_LOGO.png?v=1707224320' }}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.box}>
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>Join our floral family 💐</Text>

          {['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'password', 'confirmPassword'].map((field, i) => (
            <TextInput
              key={i}
              style={styles.input}
              placeholder={
                field === 'confirmPassword'
                  ? 'Confirm Password'
                  : field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')
              }
              secureTextEntry={field.toLowerCase().includes('password')}
              value={(form as any)[field]}
              onChangeText={(val) => handleChange(field, val)}
              keyboardType={
                field === 'email'
                  ? 'email-address'
                  : field === 'phoneNumber'
                  ? 'phone-pad'
                  : 'default'
              }
            />
          ))}

          <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp} disabled={loading}>
            <Text style={styles.signupText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>
              Already have an account? <Text style={styles.loginBold}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>🌷 Spring Flowers © 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7FA' },
  scroll: { flexGrow: 1, alignItems: 'center', padding: 24 },
  logo: { width: 160, height: 80, marginBottom: 20 },
  box: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#FF69B4', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 20, textAlign: 'center' },
  input: {
    width: '100%',
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: '#333',
  },
  signupBtn: {
    width: '100%',
    backgroundColor: '#FF69B4',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 5,
  },
  signupText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  loginLink: { marginTop: 15, color: '#666', textAlign: 'center', fontSize: 14 },
  loginBold: { fontWeight: 'bold', color: '#FF69B4' },
  footer: { marginTop: 25, fontSize: 12, color: '#999' },
});
