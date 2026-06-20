import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

let auth = null;
let bucket = null;

export const initFirebase = () => {
  const firebase_cf = process.env.FIREBASE_CONFIG ;    
  let app = null;

  try {
    if (!firebase_cf) {
      throw new Error("Biến môi trường FIREBASE_CONFIG trống hoặc không tồn tại.");
    }

    if (getApps().length === 0) {
      let serviceAccount;

      if (firebase_cf.startsWith("{")) {
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
    }

  } catch (error) {
    console.error("Không thiết lập đc cấu hình Firebase Admin SDK!");
    console.error("Chi tiết lỗi thực tế:", error.message);
  }
};

export { bucket, auth };