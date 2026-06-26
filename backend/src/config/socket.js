import { Server } from "socket.io";
// 1. Import các hàm từ repository bạn vừa viết
import { createMessage, initializeRoom } from "../repositories/messageRepository.js";

let io = null;

export const initChatSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONT_END_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    allowEIO3: true 
  });


  io.on("connection", (socket) => {
    console.log(`⚡ Thiết bị kết nối Chat: ${socket.id}`);

    // 2. Khi một user click vào thành viên (Client phát tín hiệu join_room)
    socket.on("join_room", async (data) => {
      // data gửi từ Client lên gồm: { roomId, ownerId, employeeId }
      const { roomId, ownerId, employeeId } = data;
      
      socket.join(roomId);
      console.log(`Socket ${socket.id} đã vào phòng: ${roomId}`);

      try {
        // Tự động kích hoạt khởi tạo phòng trên Firestore nếu đây là lần đầu 2 người chat với nhau
        await initializeRoom(roomId, [ownerId, employeeId]);
      } catch (error) {
        console.error("Lỗi khi khởi tạo phòng chat trên Firestore:", error);
      }
    });

    // 3. Khi Owner hoặc Employee gõ chữ và bấm GỬI (Client phát tín hiệu send_message)
    socket.on("send_message", async (data) => {
      // data gửi từ Client gồm: { roomId, senderId, message }
      const { roomId, senderId, message } = data;

      try {
        // 🔥 LƯU DỮ LIỆU THẬT VÀO FIRESTORE QUA REPOSITORY
        const savedMsg = await createMessage(roomId, senderId, message);

        // Bắn tin nhắn thời gian thực này tới người còn lại ĐANG TRONG PHÒNG
        socket.to(roomId).emit("receive_message", savedMsg);
        
      } catch (error) {
        console.error("Không thể lưu hoặc gửi tin nhắn realtime:", error);
        // Bạn có thể emit một sự kiện lỗi về lại cho người gửi nếu muốn
        socket.emit("send_message_error", { message: "Gửi tin nhắn thất bại" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Thiết bị ngắt kết nối: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io chưa được khởi tạo!");
  return io;
};