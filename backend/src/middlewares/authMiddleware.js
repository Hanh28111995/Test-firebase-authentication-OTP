import AuthList  from "../models/permissionModel.js";
import { sendError } from "../helper/response.js"; 
import jwt from "jsonwebtoken";


export const checkPermission = (actionName) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return sendError(res, "Đăng nhập chưa được thực hiện!");
      }
      const authListFilter = await AuthList.findOne({ action: actionName, allowedRoles: user.role });

      if (!authListFilter) {
        return sendError(res, `Tác vụ '${actionName}' chưa được cấu hình quyền trên hệ thống!`);
      }
      const isAllowed = authListFilter.allowedRoles.includes(user.role);
      if (!isAllowed) {
        return sendError(res, `Tài khoản với vai trò [${user.role}] không có quyền thực hiện hành động này.`);
      }      
      next();
    } catch (error) {
      console.error("Lỗi phân quyền hệ thống:", error);
      return sendError(res, "Lỗi phân quyền hệ thống!", 500);
    }
  };
};

//
// CRUD_ALL_USERS, 
// CRUD_ONE_USER, 
// CRUD_ALL_TASK, 
// CRUD_ONE_TASK, 
// CRUD_ALL_PROJECTS, 
// CRUD_ONE_PROJECT, 
// CRUD_ALL_NOTIFICATIONS, 
// CRUD_ONE_NOTIFICATION, 
// MESSAGE_ACTION //////////////////

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Token không hợp lệ !");  
    }
    const token = authHeader.split(" ")[1];    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);      
    req.user = decoded;      
    next(); 
  } catch (error) {
    console.error("JWT Verification Error:", error.message);  
    return sendError(res, "Token không hợp lệ hoặc đã hết hạn !", 401);
  }
};