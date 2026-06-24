// src/pages/ChatPage.jsx
import React, { useState, useEffect } from "react";
import { socket } from "../../configs/socket";
import ChatBox from "../../components/ChatBox/ChatBox";
import "./index.scss"

export default function ChatPage({ currentUser }) {
  const [rooms, setRooms] = useState([
    { id: "room_01", name: "Employee 1", lastMessage: "Hello" },
    { id: "room_02", name: "Employee 2", lastMessage: "" },
    { id: "room_03", name: "Employee 3", lastMessage: "" },
  ]);

  const [activeRoom, setActiveRoom] = useState(rooms[0]);

  useEffect(() => {
    // Kết nối Socket toàn cục khi bước chân vào trang nhắn tin
    socket.connect();

    return () => {
      // Ngắt hoàn toàn kết nối khi user chuyển sang trang khác như Task hay Employee
      socket.disconnect();
    };
  }, []);

  return (
    <div className="chat-page-container">
      {/* BÊN TRÁI: DANH SÁCH TIN NHẮN */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h3>All Message</h3>
          <div className="search-box-mock"></div>
        </div>

        <div className="rooms-list">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`room-item ${activeRoom?.id === room.id ? "active" : ""}`}
              onClick={() => setActiveRoom(room)}
            >
              <div className="avatar-mock">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </div>
              <div className="room-info">
                <h4>{room.name}</h4>
                <p className="last-msg">
                  {room.lastMessage || "Chưa có tin nhắn"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BÊN PHẢI: KHUNG CHATBOX ĐỘC LẬP */}
      <ChatBox activeRoom={activeRoom} currentUser={currentUser} />
    </div>
  );
}
