import { apiClient } from "./apiClient";

export type LoginPayload = { email: string; password: string };

export async function loginUser(payload: LoginPayload) {
  const res = await apiClient.post("/api/User/login", payload);
  return res.data;
}

export const registerUser = async (payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  phoneNumber: string;
  address: string;
}) => {
  const res = await apiClient.post("/api/User/register", payload);
  return res.data;
};
