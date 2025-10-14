import { API_BASE_URL } from "../api/APIconfig";

export const deliveryService = {
  // ✅ Tạo delivery cho order
  async createDelivery(orderId: number) {
    const res = await fetch(`${API_BASE_URL}/Delivery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create delivery");
    return data;
  },

  // ✅ Lấy thông tin delivery theo order
  async getDeliveryByOrder(orderId: number) {
    const res = await fetch(`${API_BASE_URL}/Delivery/by-order/${orderId}`);
    const data = await res.json();
    if (!res.ok) throw new Error("Failed to fetch delivery");
    return data;
  },

  // ✅ Cập nhật trạng thái delivery
  async updateStatus(orderId: number, status: number, proofPhotoUrl?: string) {
    const body = {
      orderId,
      status,
      deliveredAt: new Date().toISOString(),
      proofPhotoUrl: proofPhotoUrl || "https://via.placeholder.com/100",
    };

    const res = await fetch(`${API_BASE_URL}/Delivery/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update delivery");
    return data;
  },
};
