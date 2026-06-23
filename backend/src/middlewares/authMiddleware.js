import { sendError, sendServerError } from "../helper/response.js";
import jwt from "jsonwebtoken";
import * as userRepo from "./../repositories/userRepository.js";
import { getAuthService } from "../config/firebase.js";

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
          `[${user.role}] không có quyền truy cập vào chức năng này.`,
        );
      }
      next();
    } catch (error) {
      console.error(error.message);
      return sendServerError(res);
    }
  };
};

export const verifyFireBaseOwner = async (req, res, next) => {
  try {
    const firebaseAccessCode = req.headers["firebase-token"];
    if (!firebaseAccessCode)
      return res
        .status(401)
        .json({ success: false, message: "Thiếu mã xác thực từ Google" });
    const firebaseAuth = getAuthService();
    const decodedToken = await firebaseAuth.verifyIdToken(firebaseAccessCode);
    const realFirebaseUid = decodedToken.uid;
    
    // Gọi Firebase giải mã trực tiếp từ máy chủ Google để lấy UID thực tế
    
    const user = await userRepo.findUserWithSecret(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng!" });

    // Đối chiếu UID thực tế với accessCode đã lưu lúc đăng nhập

    if (user.accessCode !== realFirebaseUid) {
      //THÊM code: "AUTH_MISMATCH" để khớp với Axios Interceptor ở Frontend
      return res.status(403).json({
        success: false,
        code: "AUTH_MISMATCH",
        message: "Cảnh báo: FirebaseUID không trùng khớp!"
      });
    }   
    next();
  } catch (error) {
    console.log("👉 LỖI THỰC TẾ LÀ GÌ:", error);
    return res
      .status(401)
      .json({
        success: false,
        message: "Mã xác thực Firebase đã hết hạn, vui lòng đăng nhập lại.",
      });
  }
};
