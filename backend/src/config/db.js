import mongoose from "mongoose";
import User from "./../models/userModel.js"
import { defaultOwner } from "../constants/default.js";

const MONGO_URI = process.env.MONGO_DB;
let isConnected = false; 

const connect = async () => {  
  if (isConnected) {
    console.log("Sử dụng kết nối MongoDB có sẵn");
    return;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log("Kết nối MongoDB thành công!");    
    const ownerCount = await User.countDocuments({ role: "owner" });
    if (ownerCount === 0) {
      await User.create(defaultOwner);
      console.log("👉 Đã khởi tạo tài khoản Owner mặc định cho hệ thống");
    }
    return db;
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error.message);        
  }
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