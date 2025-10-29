import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useRouter } from "expo-router";

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

  const onMyOrders = () => router.push({ pathname: "/(tabs)/orders" } as any);
  const onSettings = () => router.push("/settings");
  const onAbout = () => router.push("/about");
  const onSignOut = () => {
    // TODO: call sign out logic (clear token, context, navigate to auth)
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
      <View style={styles.header}>
        <Text style={styles.logo}>Flowerfly</Text>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>👤</Text>
        </View>
        <View style={styles.greeting}>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.name}>Sofia!</Text>
        </View>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.button} onPress={onMyOrders} activeOpacity={0.85}>
          <Text style={styles.buttonText}>My orders</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onSettings} activeOpacity={0.85}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onSignOut} activeOpacity={0.85}>
          <Text style={[styles.buttonText, { color: "#b33" }]}>Sign out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.lastButton]} onPress={onAbout} activeOpacity={0.85}>
          <Text style={styles.buttonText}>About us</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingTop: 18,
    alignItems: "center",
    paddingBottom: 8,
  },
  logo: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: "700",
    fontFamily: undefined,
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
    backgroundColor: COLORS.card,
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
  },
  name: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: 4,
  },
  card: {
    marginHorizontal: 18,
    marginTop: 8,
    backgroundColor: COLORS.card,
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