import { sendError, sendServerError } from "../helper/response.js"; 
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Token không hợp lệ !");  
    }
    const token = authHeader.split(" ")[1];    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);      
    req.user = decoded;      
    next(); 
  } catch (error) {
    console.error("JWT Verification Error:", error.message);  
    return sendError(res, "Token không hợp lệ hoặc đã hết hạn !", 401);
  }
};

export const checkRole = (allowedRole) => {
  return (req, res, next) => {
    try {
      const user = req.user;  
      if (!user) {
        return sendError(res, "User chưa dăng nhập");
      }      
      if (user.role !== allowedRole) {
        return sendError(
          res, 
          `[${user.role}] không có quyền truy cập vào chức năng này.`
        );
      }      
      next();
    } catch (error) {
      console.error(error.message);
      return sendServerError(res);
    }
  };
};

