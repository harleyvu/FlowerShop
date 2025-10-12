import { Link } from "expo-router";
import React, { useState } from "react";
import {
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

const bg = require("../../assets/background.png"); // <-- same background

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.logo}>Flowerfly</Text>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign Up</Text>

              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor="#9aa6a0"
                style={styles.input}
              />

              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor="#9aa6a0"
                style={styles.input}
              />

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

              <TextInput
                value={confirm}
                onChangeText={setConfirm}
                placeholder="Confirm Password"
                placeholderTextColor="#9aa6a0"
                style={styles.input}
                secureTextEntry
              />

              {/* Primary sign up button */}
              <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
                <Text style={styles.primaryButtonText}>Sign up</Text>
              </TouchableOpacity>

              {/* OR separator */}
              <View style={styles.orWrap}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
              </View>

              {/* Continue as guest */}
              <Link href=".." asChild>
                <TouchableOpacity style={styles.ghostButton} activeOpacity={0.85}>
                  <Text style={styles.ghostText}>Continue as a guest</Text>
                </TouchableOpacity>
              </Link>

              {/* Already have account -> go to login */}
              <View style={styles.signupWrap}>
                <Text style={styles.smallText}>Already have account ? </Text>
                <Link href="login" style={styles.signUpLink}>
                  <Text style={styles.signUpText}>Log in</Text>
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
  bg: { flex: 1, width: "100%", height: "100%" },
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
  },
  logo: { fontSize: 36, color: "#1f7a4c", fontWeight: "700", marginBottom: 12 },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 6,
  },
  cardTitle: { fontSize: 20, color: "#1f7a4c", fontWeight: "700", marginBottom: 12 },
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
  primaryButton: {
    backgroundColor: "#27c16b",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  orWrap: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: "#e6eee9" },
  orText: { marginHorizontal: 8, color: "#8aa99a", fontSize: 12, fontWeight: "600" },
  ghostButton: {
    borderWidth: 1,
    borderColor: "#27c16b",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  ghostText: { color: "#27c16b", fontWeight: "700" },
  signupWrap: { flexDirection: "row", justifyContent: "center", marginTop: 12 },
  smallText: { color: "#6b6b6b" },
  signUpText: { color: "#1f7a4c", fontWeight: "700" },
  signUpLink: { marginLeft: 6 },
});