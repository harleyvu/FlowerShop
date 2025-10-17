import { apiClient } from "./apiClient";

export type LoginPayload = { email: string; password: string };

export async function loginUser(payload: LoginPayload) {
  // POST http://localhost:5098/api/User/login
  const res = await apiClient.post("/api/User/login", payload);
  return res.data; // ví dụ { success, message, data: { user, token } } hoặc { token, ... }
}
