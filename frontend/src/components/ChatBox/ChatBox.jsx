import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../../configs/socket";
import { getChatHistoryApi, markAsReadApi } from "../../services/chat.service";

const ChatBox = ({ activeRoom, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống dòng tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Luồng xử lý khi ĐỔI PHÒNG CHAT (activeRoom thay đổi)
  useEffect(() => {
    // 🛡️ SỬA 1: Chặn tuyệt đối nếu phòng bị rỗng hoặc dính chuỗi hỏng "undefined" từ Front-end
    if (!activeRoom?.roomId || activeRoom.roomId.includes("undefined")) {
      console.warn("⚠️ Room ID chưa sẵn sàng hoặc không hợp lệ:", activeRoom?.roomId);
      return;
    }

    // 🛡️ SỬA 2: Lấy thực thể socket *bên trong* useEffect để đảm bảo giá trị mới nhất
    const socket = getSocket();
    if (!socket) {
      console.warn("⚠️ Socket kết nối chưa sẵn sàng. Đang đợi...");
      return;
    }

    // --- LUỒNG HTTP API ---
    const loadChatHistory = async () => {
      try {
        const res = await getChatHistoryApi(activeRoom.roomId);
        if (res?.success) {
          setMessages(res.data || []);
        }
        
        // Chỉ gọi API xóa chấm đỏ khi roomId đã sạch sẽ hoàn toàn
        await markAsReadApi(activeRoom.roomId);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử chat:", error);
      }
    };

    loadChatHistory();

    // --- LUỒNG SOCKET REALTIME ---
    const currentUserId = currentUser?.uid || currentUser?._id;

    // Chuẩn bị payload báo lên Server (Sử dụng ID nhất quán)
    const joinPayload = {
      roomId: activeRoom.roomId,
      ownerId: currentUser?.role === "owner" ? currentUserId : "owner_uid_fallback", 
      employeeId: currentUser?.role === "employee" ? currentUserId : activeRoom.uid
    };

    // Phát tín hiệu gia nhập phòng an toàn
    socket.emit("join_room", joinPayload);
    
    // Lắng nghe tin nhắn real-time đổ về từ Server
    socket.on("receive_message", (newMessage) => {
      if (newMessage.roomId === activeRoom.roomId) {
        // 🛡️ SỬA 3: Chống trùng lặp tin nhắn
        setMessages((prev) => {
          const isExist = prev.some((msg) => msg.id === newMessage.id || (msg.createdAt === newMessage.createdAt && msg.senderId === newMessage.senderId));
          if (isExist) return prev;
          return [...prev, newMessage];
        });
      }
    });

    // Dọn dẹp listener khi chuyển phòng khác hoặc unmount
    return () => {
      socket.off("receive_message");
    };
  // Lắng nghe thêm biến currentUser để cập nhật chính xác quyền khi socket bắt đầu gửi nhận
  }, [activeRoom?.roomId, currentUser]);

  // Xử lý sự kiện nhấn Enter gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const socket = getSocket();
    if (!socket) {
      alert("Mất kết nối real-time, vui lòng thử lại!");
      return;
    }

    const currentUserId = currentUser?.uid || currentUser?._id || "mock_uid";

    const messageData = {
      roomId: activeRoom.roomId,
      senderId: currentUserId, 
      message: textInput.trim(),
    };

    // 🚀 Bắn tin nhắn real-time lên Server
    socket.emit("send_message", messageData);

    // 🛡️ SỬA 4: Bỏ setMessages thủ công ở đây để tránh bị nhân đôi tin nhắn,
    // Hãy để listener "receive_message" ở useEffect phía trên lo toàn bộ việc đẩy tin nhắn lên màn hình.
    
    setTextInput("");
  };

  if (!activeRoom) {
    return (
      <div className="no-active-room">
        <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
      </div>
    );
  }

  return (
    <div className="chat-content-area">
      <div className="messages-display">
        {messages.map((msg, index) => {
          const currentUserId = currentUser?.uid || currentUser?._id || "mock_uid";
          const isOwn = msg.senderId === currentUserId;
          return (
            <div key={msg.id || index} className={`msg-bubble-wrapper ${isOwn ? "own" : "other"}`}>
              <div className="msg-bubble">
                <p>{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          placeholder="Reply message"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button type="submit" style={{ display: "none" }}>Gửi</button>
      </form>
    </div>
  );
};

export default ChatBox;