import { USER_KEY } from "../../constants/common";
import { 
  SET_USER_INFO, 
  SET_AUTH_ROLE, 
  SET_VERIFYING_INFO, 
  SET_AUTH_LOADING, 
  SET_AUTH_ERROR,
  SET_EMPLOYEE_STORE_LIST, 
  SET_EMPLOYEE_ACTION_LOADING, 
  SET_CHAT_CURRENT_SELECTED_EMPLOYEE 
} from "../types/user.type";

// Khôi phục thông tin đăng nhập cũ từ localStorage nếu có (Tránh mất login khi F5)
let userInfor = null;
try {
  const savedUser = localStorage.getItem(USER_KEY);
  if (savedUser) userInfor = JSON.parse(savedUser);
} catch (error) {
  console.error("Lỗi parse thông tin user từ localStorage:", error);
}

const DEFAULT_STATE = {
  userInfor,                               // Thông tin chi tiết của User sau khi đăng nhập thành công
  authenRole: userInfor?.role || null,      // Phân quyền của người dùng (Admin, Employee, v.v.)
  
  // Luồng Xác thực (Login OTP)
  otpVerifyingInfo: null,                  // Thông tin hiển thị khi xác thực (Số điện thoại / Email nhận mã)
  authenLoading: false,                     // Trạng thái Loading khi gửi mã hoặc xác nhận OTP
  authenError: null,                        // Thông điệp báo lỗi giao diện đăng nhập

  // Quản lý Nhân viên & Chat nội bộ
  employeeStoreList: [],                    // Danh sách nhân viên lấy từ hệ thống
  employeeActionLoading: false,             // Trạng thái Loading khi thao tác với nhân viên
  chatCurrentSelectedEmployee: null         // Nhân viên đang được chọn để nhắn tin chat
};

export const userReducer = (state = DEFAULT_STATE, { type, payload }) => {
  switch (type) {
    case SET_USER_INFO:
      return { ...state, userInfor: payload };

    case SET_AUTH_ROLE:
      return { ...state, authenRole: payload };

    case SET_VERIFYING_INFO:
      return { ...state, otpVerifyingInfo: payload };

    case SET_AUTH_LOADING:
      return { ...state, authenLoading: payload };

    case SET_AUTH_ERROR:
      return { ...state, authenError: payload };

    case SET_EMPLOYEE_STORE_LIST:
      return { ...state, employeeStoreList: payload };

    case SET_EMPLOYEE_ACTION_LOADING:
      return { ...state, employeeActionLoading: payload };

    case SET_CHAT_CURRENT_SELECTED_EMPLOYEE:
      return { ...state, chatCurrentSelectedEmployee: payload };

    default:
      return state;
  }
};