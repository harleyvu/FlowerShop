import { API_BASE_URL } from "../api/APIconfig";

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: number;
    };
  };
}

/**
 * Service xử lý đăng nhập
 */
export const userService = {
  async login({ email, password }: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/User/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      return data as LoginResponse;
    } catch (error: any) {
      console.error("⚠️ userService.login error:", error);
      throw error;
    }
  },

  register: async (userInfo: any) => {
    const response = await fetch(`${API_BASE_URL}/User/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInfo),
    });
    const data = await response.json();
    return { ok: response.ok, data };
  },
};
