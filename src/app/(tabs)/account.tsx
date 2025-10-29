import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { clearAuthToken } from "../../api/apiClient";
import { useCart } from "../../contexts/CartContext";
import { restoreUser } from "../../controllers/userController";

const COLORS = {
  primary: "#27c16b",
  dark: "#1f7a4c",
  text: "#203a2f",
  sub: "#6b8f80",
  bg: "#f6faf7",
  card: "#ffffff",
  border: "#e6eee9",
};

export default function AccountScreen() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [user, setUser] = useState<any | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        const currentUser = await restoreUser();
        setUser(currentUser);
      };
      loadUser();
    }, [])
  );

  const onMyOrders = () => router.push({ pathname: "/(tabs)/orders" } as any);

  const onSignOut = async () => {
    await clearAuthToken();
    clearCart();
    // You might want to clear other user-related async storage here
    router.replace("/(auth)/login");
  };

  return (
    <ImageBackground
      source={require("../../assets/background.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" />
        <View style={styles.header}>
          <Text style={styles.logo}>Flowerfly</Text>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <View style={styles.greeting}>
            <Text style={styles.hello}>Hello,</Text>
            <Text style={styles.name}>{user?.userName || "Guest"}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <TouchableOpacity style={styles.button} onPress={onMyOrders} activeOpacity={0.85}>
            <Text style={styles.buttonText}>My orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.lastButton]} onPress={onSignOut} activeOpacity={0.85}>
            <Text style={[styles.buttonText, { color: "#b33" }]}>Sign out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent", // Make safe area transparent
  },
  header: {
    paddingTop: 18,
    alignItems: "center",
    paddingBottom: 8,
  },
  logo: {
    fontSize: 32,
    color: COLORS.dark,
    fontFamily: "Pacifico-Regular", // Use custom font
  },
  profileSection: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 56,
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent white
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  avatarIcon: {
    fontSize: 40,
  },
  greeting: {
    marginTop: 12,
    alignItems: "center",
  },
  hello: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: "600",
  },
  name: {
    fontSize: 28,
    color: COLORS.dark,
    fontWeight: "700",
    marginTop: 4,
  },
  card: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Slightly transparent white
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
  },
  button: {
    backgroundColor: "#f2fbf6",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 26,
    alignItems: "center",
    marginBottom: 12,
  },
  lastButton: {
    marginBottom: 0,
  },
  buttonText: {
    color: COLORS.dark,
    fontWeight: "700",
    fontSize: 14,
  },
});