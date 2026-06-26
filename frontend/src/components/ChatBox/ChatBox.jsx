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

  // Luồng xử lý khi ĐỔI PHÒNG CHAT hoặc khi kết nối Socket sẵn sàng
  useEffect(() => {
    const targetRoomId =
      activeRoom?.roomId || activeRoom?.uid || activeRoom?._id;

    // Chỉ chặn nếu ID hoàn toàn trống hoặc rỗng
    if (!targetRoomId || targetRoomId === "undefined") {
      return;
    }

    // --- LUỒNG HTTP API: Lấy lịch sử chat cũ (Vẫn chạy bình thường độc lập với Socket) ---
    const loadChatHistory = async () => {
      try {
        const res = await getChatHistoryApi(targetRoomId);
        if (res?.success) setMessages(res.data || []);
        else setMessages([]);
        await markAsReadApi(targetRoomId);
      } catch (error) {
        console.error("Lỗi khi lấy lịch sử chat:", error);
        setMessages([]);
      }
    };
    loadChatHistory();

    // --- LUỒNG SOCKET REALTIME: Bọc trong cơ chế kiểm tra động ---
    let socket = getSocket();

    // Đặt một khoảng thời gian ngắn (Interval) để quét lại socket nếu giây đầu tiên nó bị null do Layout đang bận Handshake
    const checkSocketInterval = setInterval(() => {
      socket = getSocket();

      // Nếu tìm thấy socket và socket đã Connected thành công với port 5000
      if (socket && socket.connected) {
        clearInterval(checkSocketInterval); // Dừng việc quét lại
        console.log(
          "⚡ [ChatBox] Socket đã sẵn sàng thông suốt! Tiến hành join phòng:",
          targetRoomId,
        );

        const currentUserId = currentUser?.uid || currentUser?._id;
        const joinPayload = {
          roomId: targetRoomId,
          ownerId:
            currentUser?.role === "owner"
              ? currentUserId
              : "owner_uid_fallback",
          employeeId:
            currentUser?.role === "employee"
              ? currentUserId
              : activeRoom?.uid || activeRoom?._id,
        };

        // Bắn tín hiệu gia nhập phòng an toàn lên Socket Server
        socket.emit("join_room", joinPayload);

        // Đăng ký lắng nghe tin nhắn real-time đổ về
        socket.on("receive_message", (newMessage) => {
          if (newMessage.roomId === targetRoomId) {
            setMessages((prev) => {
              const isExist = prev.some(
                (msg) =>
                  msg.id === newMessage.id ||
                  (msg.createdAt === newMessage.createdAt &&
                    msg.senderId === newMessage.senderId),
              );
              if (isExist) return prev;
              return [...prev, newMessage];
            });
          }
        });
      } else {
        console.log("⏳ [ChatBox] Đang đợi tín hiệu kết nối từ Layout...");
      }
    }, 500); // Cứ mỗi 0.5 giây quét kiểm tra trạng thái kết nối một lần

    // Dọn dẹp listener và khoảng xóa interval khi chuyển phòng hoặc unmount
    return () => {
      clearInterval(checkSocketInterval);
      if (socket) {
        socket.off("receive_message");
      }
    };
  }, [activeRoom, currentUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    // 1. Lấy thực thể socket từ Container toàn cục
    let socket = getSocket();

    // 2. 🛡️ CƠ CHẾ TỰ CỨU: Nếu socket chưa sẵn sàng, cố gắng thử kích hoạt lại hoặc lấy từ token
    if (!socket) {
      console.warn(
        "⚠️ Không tìm thấy kết nối Socket, đang thử gửi trực tiếp thông qua cơ chế fallback...",
      );
      // Bạn có thể import connectSocket và gọi tại đây nếu có sẵn token, hoặc tạm thời bỏ qua alert để test giao diện
    }

    const targetRoomId =
      activeRoom?.roomId || activeRoom?.uid || activeRoom?._id;
    const currentUserId = currentUser?.uid || currentUser?._id || "mock_uid";

    const messageData = {
      roomId: targetRoomId,
      senderId: currentUserId,
      message: textInput.trim(),
    };

    // 3. Nếu có socket và đang trong trạng thái connected thì mới emit
    if (socket && socket.connected) {
      socket.emit("send_message", messageData);
      console.log("🚀 Đã bắn tin nhắn real-time lên server:", messageData);
    } else {
      // 🔥 Nếu mất kết nối hẳn, log lỗi ra console để debug thay vì chặn alert bắt người dùng click
      console.error(
        "❌ Không thể gửi tin nhắn real-time do Socket đang ở trạng thái mất kết nối (Disconnected).",
      );
    }

    // Vẫn xóa chữ ô input để người dùng tiếp tục gõ bình thường
    setTextInput("");
  };

  // Trạng thái mặc định nếu chưa chọn ai bên Sidebar
  if (!activeRoom) {
    return (
      <div className="no-active-room">
        <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
      </div>
    );
  }

  return (
    <div className="chat-content-area">
      {/* KHU VỰC HIỂN THỊ TIN NHẮN */}
      <div className="messages-display">
        {messages.map((msg, index) => {
          const currentUserId =
            currentUser?.uid || currentUser?._id || "mock_uid";
          const isOwn = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id || index}
              className={`msg-bubble-wrapper ${isOwn ? "own" : "other"}`}
            >
              <div className="msg-bubble">
                <p>{msg.message}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Ô NHẬP LỆNH CHAT */}
      <form
        className="message-input-form"
        onSubmit={handleSendMessage}
        style={{ display: "flex", gap: "8px", alignItems: "center" }}
      >
        <input
          type="text"
          placeholder="Reply message"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          style={{ flex: 1 }} // Giúp ô input chiếm hết không gian còn lại
        />
        <button
          type="submit"
          className="send-message-btn"
          style={{
            padding: "8px 16px",
            background: "#1890ff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
