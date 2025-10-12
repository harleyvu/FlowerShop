import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "../services/userService";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const data = await userService.login({ email, password });
      console.log("📥 Login response:", data);

      if (data.success) {
        const userData = JSON.stringify(data.data);
        await AsyncStorage.setItem("userData", userData);
        console.log("💾 User data saved to AsyncStorage");

        const role = data.data?.user?.role;
        const token = data.data?.token;
        const userId = data.data?.user?.id;

        let targetScreen = "Customer";
        if (role === 1) targetScreen = "Admin";
        else if (role === 2) targetScreen = "Seller";

        Alert.alert("✅ Success", "Login successful!", [
          {
            text: "Continue",
            onPress: () =>
              navigation.replace(targetScreen, {
                userId,
                token,
              }),
          },
        ]);
      } else {
        Alert.alert("❌ Error", data.message || "Login failed");
      }
    } catch (error) {
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={{
            uri: "https://springflowers.store/cdn/shop/files/SPRING_LOGO.png?v=1707224320",
          }}
          style={styles.logo}
          resizeMode="contain"
        />

        <View style={styles.box}>
          <Text style={styles.title}>Welcome Back 🌸</Text>
          <Text style={styles.subtitle}>
            Log in to continue your floral journey
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.btnText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Alert.alert("Feature coming soon!")}
          >
            <Text style={styles.link}>Forgot your password?</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>🌷 Spring Flowers © 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7FA",
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 20,
  },
  box: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#FFB6C1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF69B4",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#FFF0F5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  loginBtn: {
    width: "100%",
    backgroundColor: "#FF69B4",
    padding: 14,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  link: {
    marginTop: 15,
    color: "#FF69B4",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    marginTop: 40,
    fontSize: 12,
    color: "#999",
  },
});
