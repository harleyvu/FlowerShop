import { API_BASE_URL } from "../api/APIconfig";

export const orderService = {
  async createOrder(orderBody: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/Order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderBody),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Order creation failed");
    return data;
  },
  async getOrders(userId: number, token: string) {
    const res = await fetch(`${API_BASE_URL}/Order?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return await res.json();
  },

  async getAllOrders(token: string) {
    const res = await fetch(`${API_BASE_URL}/Order`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch all orders");
    return await res.json();
  },

  // 🔹 Xóa đơn hàng
  async deleteOrder(orderId: number, token: string) {
    const res = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete order");
    return true;
  },
};
