import { loginUser } from "../api/userModel";
import { setAuthToken } from "../api/apiClient";

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
  return { token, user: data?.data?.user ?? null };
}
