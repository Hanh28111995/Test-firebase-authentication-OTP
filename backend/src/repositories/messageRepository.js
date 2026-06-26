import { FieldValue } from "firebase-admin/firestore";
import { getDB } from "../config/firebase.js"; 

/**
 * 1. Kiểm tra hoặc tự động khởi tạo Phòng Chat (Room) nếu chưa tồn tại
 * @param {string} roomId - ID phòng chat (Ví dụ: room_ownerUID_employeeUID)
 * @param {Array} participants - Mảng chứa 2 UID [ownerId, employeeId]
 */
export const initializeRoom = async (roomId, participants) => {
  const db = getDB();
  const roomRef = db.collection("rooms").doc(roomId);
  const roomDoc = await roomRef.get();

  if (!roomDoc.exists) {
    await roomRef.set({
      participants: participants,
      lastMessage: "",
      lastMessageAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    });
  }
  return roomRef;
};

export const createMessage = async (roomId, senderId, messageContent) => {
  const db = getDB();
  const roomRef = db.collection("rooms").doc(roomId);
  const messageRef = roomRef.collection("messages").doc(); // Tự sinh ID tin nhắn ngẫu nhiên

  await db.runTransaction(async (transaction) => {
    // Bước A: Ghi dữ liệu tin nhắn chi tiết vào sub-collection
    transaction.set(messageRef, {
      senderId: senderId,
      message: messageContent,
      createdAt: FieldValue.serverTimestamp(),
      isRead: false
    });

    // Bước B: Đè thông tin mới nhất lên Document của Room cha
    transaction.update(roomRef, {
      lastMessage: messageContent,
      lastMessageAt: FieldValue.serverTimestamp()
    });
  });

  return {
    id: messageRef.id,
    roomId,
    senderId,
    message: messageContent
  };
};

export const getMessageHistory = async (roomId, limit = 50) => {
  const db = getDB();
  const messagesSnapshot = await db
    .collection("rooms")
    .doc(roomId)
    .collection("messages")
    .orderBy("createdAt", "asc") // Cũ ở trên, mới ở dưới giống UI Figma
    .limit(limit)
    .get();

  if (messagesSnapshot.empty) return [];

  return messagesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    // Convert kiểu Timestamp của Firestore về chuỗi ISO string cho React dễ xài
    createdAt: doc.data().createdAt ? doc.data().createdAt.toDate().toISOString() : null
  }));
};

export const getRoomDetails = async (roomId) => {
  const db = getDB();
  const roomDoc = await db.collection("rooms").doc(roomId).get();
  if (!roomDoc.exists) return null;
  return { id: roomDoc.id, ...roomDoc.data() };
};

export const getUnreadMessages = async (roomId, currentUserId) => {
  const db = getDB();
  return await db.collection("rooms")
    .doc(roomId)
    .collection("messages")
    .where("senderId", "!=", currentUserId)
    .where("isRead", "==", false)
    .get();
};


export const bulkMarkAsRead = async (docs) => {
  const db = getDB();
  const batch = db.batch();
  
  docs.forEach((doc) => {
    batch.update(doc.ref, { isRead: true });
  });

  return await batch.commit();
};