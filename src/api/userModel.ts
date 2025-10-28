import { apiClient } from "./apiClient";

export type LoginPayload = { email: string; password: string };

export async function loginUser(payload: LoginPayload) {
  const res = await apiClient.post("/api/User/login", payload);
  return res.data;
}

// --- ADD: register ---
export type RegisterPayload = {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string; // ISO
  role?: number;
};

type RegisterResponse = {
  success: boolean;
  message: string;
  data: {
    user: any;
    token: string;
  };
};

export async function registerUser(payload: RegisterPayload) {
  // POST http://localhost:5098/api/User/register
  const res = await apiClient.post<RegisterResponse>("/api/User/register", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data; // { success, message, data: { user, token } }
}
