import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
import type { Flower } from "../types/flower";

const ENV_BASE = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
const BASE_URL =
  ENV_BASE ||
  (Platform.OS === "android" ? "http://10.0.2.2:5098" : "http://127.0.0.1:5098");

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ADD: Token helpers exported so other modules can call them
const TOKEN_KEY = "AUTH_TOKEN";

export async function setAuthToken(token: string) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    apiClient.defaults.headers = apiClient.defaults.headers ?? {};
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore storage errors
  }
}

export async function restoreAuthToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      apiClient.defaults.headers = apiClient.defaults.headers ?? {};
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      return token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearAuthToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    if (apiClient.defaults.headers) delete apiClient.defaults.headers.Authorization;
  } catch {
    // ignore
  }
}

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
