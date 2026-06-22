import admin from "firebase-admin"; 
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore"; 
import { defaultOwner } from "../constants/default.js";
import path from "path";
import fs from "fs";

// 🟢 1. ĐƯA LÊN TRÊN CÙNG: Khai báo toàn cục để export ra cho các file Repository sử dụng
let db = null;
let bucket = null;
let auth = null;

export const initFirebase = async () => {
  const firebase_cf = process.env.FIREBASE_CONFIG;    
  let app = null;

  try {
    if (!firebase_cf) {
      throw new Error("Biến môi trường FIREBASE_CONFIG trống hoặc không tồn tại.");
    }

    if (getApps().length === 0) {
      let serviceAccount;

      if (firebase_cf.trim().startsWith("{")) {
        serviceAccount = JSON.parse(firebase_cf);
      } else {
        const resolvedPath = path.resolve(process.cwd(), firebase_cf);
        const fileContent = fs.readFileSync(resolvedPath, "utf8");
        serviceAccount = JSON.parse(fileContent);
      }

      const bucketName = serviceAccount.project_id ? `${serviceAccount.project_id}.firebasestorage.app` : null;

      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: bucketName
      });
      console.log("Thiết lập Firebase Admin SDK thành công!");
    } else {
      app = getApps()[0];
      console.log("Tái sử dụng ứng dụng Firebase đã khởi tạo.");
    }

    if (app) {
      bucket = getStorage(app).bucket();
      auth = getAuth(app);      
      
      // 🟢 2. SỬA TẠI ĐÂY: Bỏ chữ "const", gán trực tiếp vào biến toàn cục đã khai báo ở trên
      db = getFirestore(app); 
      
      const usersRef = db.collection("users");            
      const snapshot = await usersRef.limit(1).get();

      if (snapshot.empty) {
        await usersRef.add({
          ...defaultOwner,
          status: true,
          createdAt: new Date().toISOString()
        });
        console.log("👉 Bộ sưu tập users trống. Đã khởi tạo tài khoản Owner mặc định thành công!");
      }
    }

  } catch (error) {
    console.error("Không thiết lập đc cấu hình Firebase Admin SDK!");
    console.error("Chi tiết lỗi thực tế:", error.message);
  }
};

export const getDB = () => db; 
export const getAuthService = () => auth;
export const getBucket = () => bucket;