import { getFirestore } from "firebase-admin/firestore";
// 🔥 IMPORT HOÀN TOÀN TỪ REPOSITORY CỦA BẠN
import { 
  getRoomDetails, 
  getMessageHistory, 
  getUnreadMessages, 
  bulkMarkAsRead 
} from "../repositories/messageRepository.js";

/**
 * 1. API: Lấy danh sách nhân viên hiển thị ở cột bên trái (Dành cho Owner)
 * Route: GET /api/chat/owner-members
 */
export const getMembersForOwner = async (req, res) => {
  try {
    const db = getFirestore();
    const ownerId = req.user.uid; // Lấy từ middleware verifyToken

    // Lấy toàn bộ user có role là employee
    const usersSnapshot = await db.collection("users").where("role", "==", "employee").get();

    if (usersSnapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    const members = [];

    for (const doc of usersSnapshot.docs) {
      const employeeData = doc.data();
      const employeeId = doc.id;
      const roomId = `room_${ownerId}_${employeeId}`;

      // 🔄 GỌI REPOSITORY: Lấy thông tin phòng chat ngầm
      const roomDetails = await getRoomDetails(roomId);

      members.push({
        uid: employeeId,
        userName: employeeData.userName || "Nhân viên chưa đặt tên",
        avatar: employeeData.avatar || "",
        roomId: roomId,
        lastMessage: roomDetails?.lastMessage || "Bắt đầu cuộc trò chuyện mới"
      });
    }

    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error("❌ Lỗi tại getMembersForOwner:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * 2. API: Lấy danh sách các Owner cho nhân viên chọn (Dành cho Employee)
 * Route: GET /api/chat/employee-members
 */
export const getMembersForEmployee = async (req, res) => {
  try {
    const db = getFirestore();
    const employeeId = req.user.uid;

    // Lấy toàn bộ user có role là owner
    const ownersSnapshot = await db.collection("users").where("role", "==", "owner").get();

    if (ownersSnapshot.empty) {
      return res.status(200).json({ success: true, data: [] });
    }

    const members = [];

    for (const doc of ownersSnapshot.docs) {
      const ownerData = doc.data();
      const ownerId = doc.id;
      const roomId = `room_${ownerId}_${employeeId}`;

      // 🔄 GỌI REPOSITORY: Lấy thông tin phòng chat ngầm
      const roomDetails = await getRoomDetails(roomId);

      members.push({
        uid: ownerId,
        userName: ownerData.userName || "Chủ cửa hàng",
        avatar: ownerData.avatar || "",
        roomId: roomId,
        lastMessage: roomDetails?.lastMessage || "Bắt đầu cuộc trò chuyện mới"
      });
    }

    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error("❌ Lỗi tại getMembersForEmployee:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * 3. API: Lấy tối đa 50 tin nhắn cũ của một phòng chat đổ vào khung bên phải (Dùng chung)
 * Route: GET /api/chat/history/:roomId
 */
export const getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ success: false, message: "Thiếu Room ID!" });
    }

    // 🔄 GỌI REPOSITORY: Lấy lịch sử chat
    const history = await getMessageHistory(roomId, 50);
    return res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("❌ Lỗi tại getChatHistory:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * 4. API: Đánh dấu tất cả tin nhắn trong phòng là ĐÃ ĐỌC (Dùng chung)
 * Route: PATCH /api/chat/room/:roomId/read
 */
export const markAsReadHandler = async (req, res) => {
  try {
    const { roomId } = req.params;
    const currentUserId = req.user.uid;

    if (!roomId) {
      return res.status(400).json({ success: false, message: "Thiếu Room ID!" });
    }

    // 🔄 GỌI REPOSITORY: Quét tìm các tin nhắn chưa đọc của đối phương gửi
    const unreadSnapshot = await getUnreadMessages(roomId, currentUserId);

    if (unreadSnapshot.empty) {
      return res.status(200).json({ success: true, message: "Không có tin nhắn chưa đọc." });
    }

    // 🔄 GỌI REPOSITORY: Thực thi Batch Update chuyển sạch isRead sang true
    await bulkMarkAsRead(unreadSnapshot.docs);

    return res.status(200).json({ success: true, message: "Đã đánh dấu đọc toàn bộ cuộc hội thoại!" });
  } catch (error) {
    console.error("❌ Lỗi tại markAsReadHandler:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};