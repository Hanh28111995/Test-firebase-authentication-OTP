import { request } from "../configs/axios";

// 1. Lấy danh sách nhân viên hiển thị ở cột bên trái (Dành cho Owner)
const getOwnerMembersApi = () => {
  return request({
    url: `/api/chat/owner-members`,
    method: "GET",
  });
};

// 2. Lấy danh sách các Owner cho nhân viên chọn (Dành cho Employee)
const getEmployeeMembersApi = () => {
  return request({
    url: `/api/chat/employee-members`,
    method: "GET",
  });
};

// 3. Lấy tối đa 50 tin nhắn cũ của một phòng chat đổ vào khung bên phải
const getChatHistoryApi = (roomId) => {
  return request({
    url: `/api/chat/history/${roomId}`,
    method: "GET",
  });
};

// 4. Đánh dấu tất cả tin nhắn trong phòng là ĐÃ ĐỌC để xóa thông báo đỏ
const markAsReadApi = (roomId) => {
  return request({
    url: `/api/chat/room/${roomId}/read`,
    method: "PATCH",
  });
};

export { 
  getOwnerMembersApi, 
  getEmployeeMembersApi, 
  getChatHistoryApi, 
  markAsReadApi 
};