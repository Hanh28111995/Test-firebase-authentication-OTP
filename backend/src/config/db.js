import mongoose from "mongoose";
import AuthList from "./../models/permissionModel.js"; // Đảm bảo đúng đường dẫn tới Model của bạn
import User from "./../models/userModel.js"
import { defaultOwner, defaultPermissions } from "../constants/default.js";

const MONGO_URI = process.env.MONGO_DB;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

const connect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Không cần dùng { family: 4 } nữa vì chuỗi dài trong .env đã giải quyết triệt để
    cached.promise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    })
    .then(async (mongooseInstance) => {
      // 1. Kiểm tra và tạo mặc định cho Authlists
      const AuthTableIsEmpty = (await AuthList.countDocuments()) === 0;
      if (AuthTableIsEmpty) {        
        await AuthList.insertMany(defaultPermissions);
        console.log("👉 Đã gán mặc định cho 'authlists'");
      }

      // 2. Kiểm tra và tạo mặc định cho Users (Owner)
      const OwnerTableIsEmpty = (await User.countDocuments({ role: "owner" })) === 0;
      if (OwnerTableIsEmpty) {        
        await User.create(defaultOwner);
        console.log("👉 Đã gán mặc định cho 'users' với 1 tài khoản Owner");
      }

      console.log("✅ Kết nối MongoDB thành công!");
      return mongooseInstance; // Bắt buộc phải return instance cho promise kết nối
    }) // <--- Đã đóng đúng ngoặc nhọn và tròn của .then
    .catch((error) => {
      console.error("Lỗi kết nối MongoDB:", error.message);
      cached.promise = null; // Reset promise để lần yêu cầu sau có thể thử kết nối lại
      throw error;
    }); // <--- Đã sửa đúng cấu trúc đóng của .catch
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

const dbMiddleware = async (req, res, next) => {
  try {
    await connect();
    console.log("kết nối DB thành công");
    next(); 
  } catch (error) {
    console.error("kết nối DB gặp lỗi:", error.message);
    return res.status(500).json({
      message: "Database connection failed",
      error: error.message,
    });
  }
};

export default dbMiddleware;