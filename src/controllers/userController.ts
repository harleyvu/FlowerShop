import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from "../api/apiClient";
import { loginUser, registerUser, type RegisterPayload, type RegisterResponse } from "../api/userModel";

const USER_KEY = 'USER_PROFILE';

export async function handleLogin(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  const data = await loginUser({ email, password });

  const token =
    data?.token ?? data?.data?.token ?? data?.accessToken ?? data?.jwt;

  if (!token) {
    throw new Error(data?.message || "Invalid credentials.");
  }

  await setAuthToken(token);
  const user = data?.data?.user ?? null;

  if (user) {
    try { await AsyncStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
  }

  return { token, user };
}

// CHANGE: accept a single object and send userName (not username)
export async function handleRegister(input: {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}) {
  const { firstName, lastName, email, password, phoneNumber = "", address = "" } = input || ({} as any);
  if (!email || !password) throw new Error("Please fill in all required fields.");

  const userName = email.split("@")[0] || (firstName || "user");

  const payload: RegisterPayload = {
    userName,              // <-- correct field for BE
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    address,
    role: 3,               // optional: matches your sample
    // dateOfBirth: "0001-01-01T00:00:00", // uncomment if BE requires
  };

  const resp: RegisterResponse = await registerUser(payload);

  const token = resp?.data?.token;
  const user = resp?.data?.user;

  if (!token) throw new Error(resp?.message || "Registration failed.");

  await setAuthToken(token);
  if (user) {
    try { await AsyncStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
  }
  return { token, user };
}

export async function restoreUser() {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}