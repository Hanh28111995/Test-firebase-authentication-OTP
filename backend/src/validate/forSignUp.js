// backend/src/validate/forSignup.js
import { sendError } from "./../helper/response.js";

export const validateSignup = (req, res, next) => {
  try {
    const { userName, phoneNumber, role, email, department } = req.body;
    
    if (!userName || !phoneNumber || !role || !email || !department) {
      return sendError(res, "Vui lòng nhập đầy đủ cả 5 trường dữ liệu bắt buộc!");
    }

    if (userName.trim().length < 3) {
      return sendError(res, "Tên tài khoản phải chứa ít nhất 3 ký tự!");
    }

    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      return sendError(res, "Số điện thoại không đúng định dạng Việt Nam!");
    }

    const validRoles = ["owner", "employee"];
    if (!validRoles.includes(role)) {
      return sendError(res, "Chức vụ không hợp lệ! Chỉ chấp nhận 'owner' hoặc 'employee'.");
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim().toLowerCase())) {
      return sendError(res, "Định dạng Email không hợp lệ!");
    }

    if (department.trim().length === 0) {
      return sendError(res, "Phòng ban không được để trống chuỗi!");
    }
    
    req.body.userName = userName.trim();
    req.body.phoneNumber = phoneNumber.trim();
    req.body.email = email.trim();
    req.body.department = department.trim();

    next();
  } catch (error) {
    console.error("Validation Signup Error:", error.message);
    return sendError(res, "Đã xảy ra lỗi trong quá trình xác thực dữ liệu Form!");
  }
};