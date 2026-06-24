// src/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import { socket } from "../../configs/socket"; // Đường dẫn tới file chứa cấu hình io() của bạn

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

  // Lắng nghe luồng sự kiện Socket theo phòng chat
  useEffect(() => {
    if (!activeRoom?.id) return;

    // 1. Gửi tín hiệu gia nhập phòng chat lên Backend
    socket.emit("JOIN_ROOM", activeRoom.id);
    
    // Tạm thời reset danh sách tin nhắn để chuẩn bị nhận luồng mới (hoặc gọi API lấy lịch sử)
    setMessages([]);

    // 2. Lắng nghe tin nhắn real-time đổ về từ Server
    socket.on("RECEIVE_MESSAGE", (newMessage) => {
      if (newMessage.roomId === activeRoom.id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    // 3. Rời phòng và tắt lắng nghe khi chuyển phòng khác hoặc unmount
    return () => {
      socket.emit("LEAVE_ROOM", activeRoom.id);
      socket.off("RECEIVE_MESSAGE");
    };
  }, [activeRoom?.id]);

  // Xử lý sự kiện nhấn Enter gửi tin nhắn
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const messageData = {
      roomId: activeRoom.id,
      senderId: currentUser?._id || "owner_id_demo", 
      senderName: currentUser?.userName || "Owner_Hanh",
      content: textInput.trim(),
      createdAt: new Date().toISOString(),
    };

    // Bắn tin nhắn real-time qua WebSockets
    socket.emit("SEND_MESSAGE", messageData);
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
      {/* 1. Vùng hiển thị nội dung tin nhắn */}
      <div className="messages-display">
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === (currentUser?._id || "owner_id_demo");
          return (
            <div key={index} className={`msg-bubble-wrapper ${isOwn ? "own" : "other"}`}>
              <div className="msg-bubble">
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 2. Thanh nhập liệu (Màu xám bo góc dưới cùng) */}
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