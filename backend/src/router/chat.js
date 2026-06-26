import express from "express";
import { verifyToken } from "./../middlewares/authMiddleware.js";
import { getChatHistory, getMembersForEmployee, getMembersForOwner, markAsReadHandler } from "../controllers/chat.js";

const ChatRouter = express.Router();

// ================= DÀNH CHO OWNER =================
// 1. Lấy danh sách nhân viên để Owner chọn chat (Cột trái Figma)
ChatRouter.get("/owner-members", verifyToken, getMembersForOwner);


// ================= DÀNH CHO EMPLOYEE =================
// 2. Lấy danh sách những Owner/Cửa hàng mà nhân viên đó được quyền chat cùng
ChatRouter.get("/employee-members", verifyToken, getMembersForEmployee);


// ================= DÙNG CHUNG (CẢ 2 ROLE) =================
// 3. Lấy lịch sử nhắn tin của một phòng (Khung chat phải Figma)
ChatRouter.get("/history/:roomId", verifyToken, getChatHistory);

// 4. Đánh dấu đã đọc tin nhắn khi click vào phòng (Xóa thông báo đỏ)
ChatRouter.patch("/room/:roomId/read", verifyToken, markAsReadHandler);

export default ChatRouter;