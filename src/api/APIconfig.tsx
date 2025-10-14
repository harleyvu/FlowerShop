// apiConfig.ts
// 👉 chỉ cần sửa IP hoặc port ở đây, không cần động tới các file khác

const SERVER_IP = "192.168.1.5"; // IP máy backend
const SERVER_PORT = "5098";       // Cổng đang chạy BE

// Gộp thành base URL cho API
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}/api`;
