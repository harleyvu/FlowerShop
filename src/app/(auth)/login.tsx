import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from "expo-font";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";
import { useCart } from "../../contexts/CartContext";
import { handleLogin } from "../../controllers/userController";

import {
  ActivityIndicator,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* BACKGROUND: nếu đã có ảnh ở src/assets/background.png -> require đường dẫn tương đối */
const bg = require("../../assets/background.png"); // <-- gắn background ở đây

/* FONT: Pacifico-Regular.ttf placed at src/assets/fonts/Pacifico-Regular.ttf */
const pacificoFont = require("../../assets/fonts/Pacifico-Regular.ttf");

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const { items } = useCart();

  const [loading, setLoading] = useState(false);

const onLogin = async () => {
  if (!email || !password) {
    Alert.alert("Missing info", "Please enter email and password");
    return;
  }

  try {
    setLoading(true);
    const { user, token } = await handleLogin(email, password);

    // Kiểm tra role
    if (user?.role === 1) {
      Alert.alert("Welcome Admin", "Redirecting to admin dashboard...");
      router.replace("/admin/dashboard");
    } else {
      Alert.alert("Welcome", `Hello ${user?.userName || "User"}!`);
        router.replace("/(tabs)/home");

        // If the user has items in their cart (persisted locally), set a flag
        // so Home can show the notification after navigation.
        try {
          if (items && items.length > 0) {
            await AsyncStorage.setItem('SHOW_CART_NOTIFICATION', '1');
          }
        } catch {
          // ignore
        }
    }
  } catch (err: any) {
    Alert.alert("Login failed", err.message || "Unable to login");
  } finally {
    setLoading(false);
  }
};


  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* logo image */}
            {(() => {
              const [fontsLoaded] = useFonts({ Pacifico: pacificoFont });
              if (!fontsLoaded) return <ActivityIndicator style={{ marginBottom: 12 }} />;
              return <Text style={styles.logoText}>Flowerfly</Text>;
            })()}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Log in</Text>

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email address"
                placeholderTextColor="#9aa6a0"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#9aa6a0"
                style={styles.input}
                secureTextEntry
              />

              <TouchableOpacity style={styles.forgotWrap} activeOpacity={0.8}>
                <Text style={styles.forgotText}>
                  Forgot your <Text style={styles.bold}>Password ?</Text> Click here
                </Text>
              </TouchableOpacity>

              {/* NAVIGATE to signup when pressing this button */}
              <TouchableOpacity
  style={styles.primaryButton}
  activeOpacity={0.85}
  onPress={onLogin}
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="#fff" />
  ) : (
    <Text style={styles.primaryButtonText}>Log in</Text>
  )}
</TouchableOpacity>



              {/* Bỏ phần social buttons theo yêu cầu */}

              <View style={styles.orWrap}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
  style={styles.ghostButton}
  activeOpacity={0.85}
  onPress={() => router.replace("/(tabs)/home")}
>
  <Text style={styles.ghostText}>Continue as a guest</Text>
</TouchableOpacity>



              <View style={styles.signupWrap}>
                <Text style={styles.smallText}>Don't have an account ? </Text>
                <Link href="signup" style={styles.signUpLink}>
                  <Text style={styles.signUpText}>Sign up</Text>
                </Link>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,               // <-- cho ScrollView chiếm toàn bộ chiều cao
    justifyContent: "center", // <-- căn giữa theo chiều dọc
    alignItems: "center",     // <-- căn giữa theo chiều ngang
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logoText: {
    fontSize: 36,
    color: "#1f7a4c",
    marginBottom: 12,
    fontFamily: "Pacifico",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 20,
    color: "#1f7a4c",
    fontWeight: "700",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f6faf7",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e6eee9",
    marginBottom: 10,
    color: "#222",
  },
  forgotWrap: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 12,
    color: "#2b7a55",
  },
  bold: {
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#27c16b",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  orWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#e6eee9",
  },
  orText: {
    marginHorizontal: 8,
    color: "#8aa99a",
    fontSize: 12,
    fontWeight: "600",
  },
  ghostButton: {
    borderWidth: 1,
    borderColor: "#27c16b",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  ghostText: {
    color: "#27c16b",
    fontWeight: "700",
  },
  signupWrap: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },
  smallText: {
    color: "#6b6b6b",
  },
  signUpText: {
    color: "#1f7a4c",
    fontWeight: "700",
  },
  signUpLink: {
    marginLeft: 6,
  },
});
