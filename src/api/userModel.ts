import { apiClient } from "./apiClient";

export type LoginPayload = { email: string; password: string };

export async function loginUser(payload: LoginPayload) {
  const res = await apiClient.post("/api/User/login", payload);
  return res.data;
}

// ADD: strong types for register
export type RegisterPayload = {
  userName: string;        // <-- correct field name
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;    // optional, ISO string
  role?: number;           // optional, e.g. 3
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  data?: { user: any; token: string };
};

// FIX: use userName, not username
export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const res = await apiClient.post("/api/User/register", payload);
  return res.data;
};