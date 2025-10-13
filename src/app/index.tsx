import { Link } from "expo-router";
import React from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const bg = require("../assets/background.png");
const logo = require("../assets/logo.png"); // <-- gắn logo ở đây

const WelcomePage = () => {
  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <View style={styles.top} />

        <View style={styles.center}>
          <Text style={styles.small}>Welcome to</Text>
          {/* thay text bằng hình logo */}
          <Image source={logo} style={styles.logoImage} />
          <Text style={styles.subtitle}>Join us</Text>
        </View>

        <View style={styles.bottom}>
          {/* Link to login page (login.tsx is inside (auth) group) */}
          <Link href="login" asChild>
            <TouchableOpacity style={styles.button} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default WelcomePage;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
  },
  top: {
    flex: 0.12,
  },
  center: {
    flex: 0.6,
    alignItems: "center",
    justifyContent: "center",
  },
  small: {
    fontSize: 16,
    color: "#2b2b2b",
    marginBottom: 8,
  },
  // style cho logo image
  logoImage: {
    width: 220,
    height: 64,
    resizeMode: "contain",
    marginVertical: 8,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 14,
    color: "#333",
  },
  bottom: {
    flex: 0.28,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 10,
  },
  button: {
    backgroundColor: "#27c16b",
    width: "80%",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});