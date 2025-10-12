import { API_BASE_URL } from "../api/APIconfig";

export const flowerService = {
  async getAll() {
    const res = await fetch(`${API_BASE_URL}/Flower`);
    if (!res.ok) throw new Error("Failed to fetch flowers");
    return res.json();
  },
};
