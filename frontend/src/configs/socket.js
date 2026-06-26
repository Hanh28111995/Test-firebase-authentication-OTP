import { io } from "socket.io-client";

// Khởi tạo một object global để giữ tham chiếu duy nhất của socket trên toàn app
const socketContainer = {
  instance: null
};

export const connectSocket = (token) => {
  // Nếu đã kết nối rồi và đang thông suốt thì trả về luôn, không tạo trùng lặp
  if (socketContainer.instance?.connected) {
    return socketContainer.instance;
  }

  console.log("🔌 Đang tiến hành kết nối Socket.io với token:", token);

  // 🔥 SỬA 1: Đổi URL chính xác về cổng 5000 theo terminal của Backend
  socketContainer.instance = io("http://localhost:5000", {
    auth: {
      token: token, // Phục vụ cho socket.handshake.auth.token bên BE
    },
    // 🔥 SỬA 2: Đính thêm vào headers để nếu middleware BE bốc kiểu Bearer Token vẫn ăn khớp
    extraHeaders: {
      Authorization: token ? `Bearer ${token}` : ""
    },
    transports: ["websocket"], // Ép chạy WebSocket tránh lỗi CORS / Long-polling
    autoConnect: true,
    reconnection: true, // Tự động kết nối lại nếu rớt mạng
    forceNew: true      // Tạo kết nối mới sạch sẽ, không dùng lại cấu hình cũ lỗi
  });

  socketContainer.instance.on("connect", () => {
    console.log("✅ [Socket] Đã kết nối thành công với Server! ID:", socketContainer.instance.id);
  });

  socketContainer.instance.on("connect_error", (err) => {
    // 💡 Nếu dính lỗi verifyToken, nó sẽ nổ log đỏ ở đây kèm lý do (ví dụ: Authentication error)
    console.error("❌ [Socket] Lỗi kết nối hoặc xác thực thất bại:", err.message);
  });

  return socketContainer.instance;
};

// Đảm bảo bốc trúng object container đang chạy
export const getSocket = () => {
  return socketContainer.instance;
};

export const disconnectSocket = () => {
  if (socketContainer.instance) {
    socketContainer.instance.disconnect();
    socketContainer.instance = null;
    console.log("🔌 [Socket] Đã ngắt kết nối.");
  }
};