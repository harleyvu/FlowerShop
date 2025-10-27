import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from "../api/apiClient";
import { loginUser, registerUser } from "../api/userModel";

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

export async function handleRegister(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  phoneNumber: string = "",
  address: string = ""
) {
  if (!firstName || !lastName || !email || !password) {
    throw new Error("Please fill in all required fields.");
  }

  // Tạo username tự động từ email
  const username = email.split("@")[0];

  const data = await registerUser({
    firstName,
    lastName,
    email,
    password,
    username,
    phoneNumber,
    address,
  });

  if (data?.success || data?.status === 200 || data?.data) {
    return data;
  } else {
    throw new Error(data?.message || "Registration failed.");
  }
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
