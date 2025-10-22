import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from "../api/apiClient";
import { loginUser } from "../api/userModel";

const USER_KEY = 'USER_PROFILE';

export async function handleLogin(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  const data = await loginUser({ email, password });

  // Tuỳ BE: kiểm tra nhiều khả năng field token
  const token =
    data?.token ?? data?.data?.token ?? data?.accessToken ?? data?.jwt;

  if (!token) {
    throw new Error(data?.message || "Invalid credentials.");
  }

  await setAuthToken(token); // lưu và gắn Authorization header cho các request sau
  const user = data?.data?.user ?? null;
  // Lưu user vào AsyncStorage để có thể restore khi cần (ví dụ prefill checkout, xem orders)
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
