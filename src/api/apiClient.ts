import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";
import { Flower } from "../types/flower";

/**
 * CHỌN BASE URL:
 * - Android Emulator: http://10.0.2.2:5098
 * - iOS Simulator:    http://127.0.0.1:5098
 * - Thiết bị thật:    http://<IP_PC>:5098
 */
const API_BASE_URL =
  Platform.OS === "android" ? "http://10.87.18.179:5098" : "http://10.87.18.179:5098";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const TOKEN_KEY = "AUTH_TOKEN";

export async function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    delete apiClient.defaults.headers.common.Authorization;
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export async function restoreAuthToken() {
  const saved = await AsyncStorage.getItem(TOKEN_KEY);
  if (saved) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${saved}`;
  }
  return saved;
}

// gắn token đã lưu (nếu có) vào mọi request
apiClient.interceptors.request.use(async (config) => {
  if (!config.headers.Authorization) {
    const saved = await AsyncStorage.getItem(TOKEN_KEY);
    if (saved) {
      config.headers.Authorization = `Bearer ${saved}`;
    }
  }
  return config;
});

// Lấy danh sách hoa từ http://<baseURL>/api/Flower
export async function getFlowers(signal?: AbortSignal): Promise<Flower[]> {
  const res = await apiClient.get<Flower[]>("/api/Flower", { signal });
  return res.data;
}
