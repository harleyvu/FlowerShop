import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Flower } from "../types/flower";

const ENV_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
const BASE_URL =
  ENV_BASE ||
  (Platform.OS === "android" ? "http://10.0.2.2:5098" : "http://127.0.0.1:5098");

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

const TOKEN_KEY = "AUTH_TOKEN";

export async function setAuthToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete apiClient.defaults.headers.common.Authorization;
  }
}

// khởi động: gắn token nếu có
(async () => {
  try {
    const t = await AsyncStorage.getItem(TOKEN_KEY);
    if (t) apiClient.defaults.headers.common.Authorization = `Bearer ${t}`;
  } catch {}
})();

// Sample API dùng ở Shop
export async function getFlowers(signal?: AbortSignal): Promise<Flower[]> {
  const res = await apiClient.get<Flower[]>("/api/Flower", { signal });
  return res.data;
}

// ADD: fetch by category using query param /api/Flower?category=1..8
export async function getFlowersByCategory(category: number, signal?: AbortSignal): Promise<Flower[]> {
  const res = await apiClient.get<Flower[]>("/api/Flower", {
    params: { category },
    signal,
  });
  return res.data;
}
