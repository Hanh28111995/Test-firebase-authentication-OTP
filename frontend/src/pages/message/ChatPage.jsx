import React, { useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../../configs/socket";
// 🔥 SỬ DỤNG ĐÚNG API CHAT SERVICE ĐÃ TRIỂN KHAI VỚI FIRESTORE
import {
  getOwnerMembersApi,
  getEmployeeMembersApi,
} from "../../services/chat.service";
import ChatBox from "../../components/ChatBox/ChatBox";
import "./index.scss";
import { useSelector } from "react-redux";

export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy thông tin userInfor và accessToken từ Redux
  const { userInfor } = useSelector((state) => state.userReducer);
  const currentUser = userInfor?.user;
  const token = userInfor?.user?.loginToken;

  // 1. Luồng xử lý gọi API lấy danh sách thành viên chat
  useEffect(() => {
    if (!currentUser?.role) return;

    const fetchMembers = async () => {
      try {
        setLoading(true);
        let response;

        if (currentUser.role === "owner") {
          response = await getOwnerMembersApi();
        } else {
          response = await getEmployeeMembersApi();
        }

        const dataList = response?.data || response?.content || [];

        if (response?.success || dataList) {
          // 🔥 BƯỚC 1: Duyệt qua danh sách và làm sạch dữ liệu phòng ngay từ API
          const cleanDataList = dataList.map((room) => {
            // Nếu roomId bị null, undefined hoặc chứa chuỗi "undefined", ta tạo một ID sạch bằng uid hoặc _id
            const isRoomIdInvalid = !room.roomId || String(room.roomId).includes("undefined");
            const fallbackId = room.uid || room._id || "unknown";
            
            return {
              ...room,
              roomId: isRoomIdInvalid ? fallbackId : room.roomId,
            };
          });

          setRooms(cleanDataList);
          
          if (cleanDataList.length > 0) {
            setActiveRoom(cleanDataList[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi load danh sách chat members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [currentUser, currentUser?.role]);

  // 2. Quản lý kết nối Socket toàn cục theo vòng đời trang Chat
  useEffect(() => {
    if (!token) return;

    connectSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return (
    <div className="chat-page-container">
      {/* BÊN TRÁI: DANH SÁCH THÀNH VIÊN */}
      <div className="conversations-sidebar">
        <div className="sidebar-header">
          <h3>Members</h3>
          <div className="search-box-mock"></div>
        </div>

        <div className="rooms-list">
          {loading ? (
            <div className="loading-text">Đang tải danh sách...</div>
          ) : rooms.length === 0 ? (
            <div className="empty-text">Chưa có thành viên nào</div>
          ) : (
            rooms.map((room) => {
              // Xác định ID đại diện để kiểm tra class active chính xác nhất
              const currentRoomIdentifier = room.roomId || room.uid || room._id;
              const activeRoomIdentifier = activeRoom?.roomId || activeRoom?.uid || activeRoom?._id;
              const isActive = currentRoomIdentifier === activeRoomIdentifier;

              return (
                <div
                  key={currentRoomIdentifier}
                  className={`room-item ${isActive ? "active" : ""}`}
                  onClick={() => setActiveRoom(room)}
                >
                  <div className="avatar-mock">
                    {room.avatar ? (
                      <img
                        src={room.avatar}
                        alt={room.userName}
                        className="user-avatar-img"
                      />
                    ) : (
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    )}
                  </div>
                  <div className="room-info">
                    <h4>{room.userName}</h4>
                    <p className="last-msg">
                      {room.lastMessage || "Bắt đầu cuộc trò chuyện mới"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* BÊN PHẢI: KHUNG CHATBOX ĐỘC LẬP */}
      {activeRoom && (
        <ChatBox
          key={activeRoom.roomId || activeRoom.uid || activeRoom._id} 
          activeRoom={activeRoom}
          currentUser={currentUser}
        />        
      )}
    </div>
  );
}