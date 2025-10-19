import { apiClient } from './apiClient';

export type OrderItem = {
  productId: string;
  quantity: number;
  price?: number;
};

export type OrderCreateRequest = {
  userId?: string;
  items: OrderItem[];
  total: number;
  note?: string;
  deliveryAddress?: string;
};

export type Order = {
  id: string;
  userId?: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
};

function buildConfig(token?: string) {
  const cfg: any = {};
  if (token) cfg.headers = { Authorization: `Bearer ${token}` };
  return cfg;
}

/**
 * Create order. Tries common path '/api/orders' first, falls back to '/Order' to support different backends.
 */
export async function createOrder(payload: OrderCreateRequest, token?: string) {
  const cfg = buildConfig(token);
  try {
    const res = await apiClient.post<Order>('/api/Order', payload, cfg);
    return res.data;
  } catch (err: any) {
    // fallback for backend that exposes /Order
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      const res = await apiClient.post<Order>('/Order', payload, cfg);
      return res.data;
    }
    throw err;
  }
}

export async function getOrder(orderId: string, token?: string) {
  const cfg = buildConfig(token);
  // try api path first
  try {
    const res = await apiClient.get<Order>(`/api/Order/${orderId}`, cfg);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      const res = await apiClient.get<Order>(`/Order/${orderId}`, cfg);
      return res.data;
    }
    throw err;
  }
}

/**
 * List orders. If userId provided, use query param like /Order?userId=123 to match some backends.
 */
export async function getOrders(userId?: string | number, token?: string) {
  const cfg = buildConfig(token);
  // prefer api path
  try {
    // if userId provided, request server-side filtered list
    const path = userId != null ? `/api/Order?userId=${userId}` : '/api/Order';
    const res = await apiClient.get<Order[]>(path, cfg);
    return res.data;
  } catch (err: any) {
    // fallback to /Order?userId=...
    const params = userId != null ? `?userId=${userId}` : '';
    const res = await apiClient.get<Order[]>(`/Order${params}`, cfg);
    return res.data;
  }
}

export async function getOrdersByUser(userId: string | number, token?: string) {
  return await getOrders(userId, token);
}

export async function deleteOrder(orderId: string | number, token?: string) {
  const cfg = buildConfig(token);
  try {
    const res = await apiClient.delete(`/api/orders/${orderId}`, cfg);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      await apiClient.delete(`/Order/${orderId}`, cfg);
      return true;
    }
    throw err;
  }
}

export default { createOrder, getOrder, getOrders, deleteOrder };
