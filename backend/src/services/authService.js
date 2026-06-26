import * as authRepository from "../repositories/authRepository.js";
import { getAuthService } from "../config/firebase.js"; 
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const createJWT = async (user) => {
  return jwt.sign(
    {
      _id: user._id,
      userName: user.userName,
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" },
  );
};

// LOGIC: SIGNIN OWNER (PHONE OTP AUTH)
export const processLoginPhone = async (phoneNumber) => {
  try {    
    const user = await authRepository.findUserByPhone(phoneNumber, "owner");
    if (!user) throw new Error("User does not exist trong hệ thống.");

    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.slice(1);
    }
    console.log("✅ SĐT hợp lệ, gửi lại cho FE xử lý tiếp:", formattedPhone);
    return {
      success: true,
      phoneNumber: formattedPhone,
    };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const processCheckPhoneAccessCode = async (idToken) => {  
  const firebaseAuth = getAuthService();  
  if (!firebaseAuth) {
    throw new Error("FIREBASE_NOT_INITIALIZED");
  }
  let decodedToken;
  try {    
    decodedToken = await firebaseAuth.verifyIdToken(idToken);
  } catch (firebaseError) {
    console.error("Firebase Token Verification Failed:", firebaseError.message);
    throw new Error("INVALID_FIREBASE_TOKEN");
  }
  const firebasePhoneNumber = decodedToken.phone_number;
  if (!firebasePhoneNumber) {
    throw new Error("NO_PHONE_NUMBER_IN_TOKEN");
  }
  let formattedPhone = firebasePhoneNumber;
  if (firebasePhoneNumber.startsWith("+84")) {
    formattedPhone = "0" + firebasePhoneNumber.slice(3);
  }

  // 1. Lấy thông tin user (đã bị giấu accessCode gốc từ Repo)
  const user = await authRepository.findUserByPhone(formattedPhone, "owner");
  if (!user) {
    throw new Error("DB_OWNER_NOT_MATCH");
  }
  // Đảm bảo thuộc tính rỗng trước khi xử lý ghi đè
  user.accessCode = "";

  // 2. Cập nhật mã UID mới tinh từ Google xuống Database
  await authRepository.updateAccessCode(user, decodedToken.uid);

  // 3. 🟢 GÁN MÃ XỊN VÀO RAM: Đồng bộ UID này ngược lại vào object user 
  // Để lúc Frontend lưu vào LocalStorage có mã xịn đối chiếu cho các request sau
  user.accessCode = decodedToken.uid;

  // 4. Tạo mã JWT nội bộ (Lúc này payload đã chứa accessCode xịn)
  const JWTtoken = await createJWT(user);

  // 5. Trả về trọn bộ cho Frontend
  return { user, loginToken: JWTtoken };
};

// LOGIC: SIGNIN EMPLOYEE (EMAIL OTP AUTH)
export const processLoginEmail = async (email) => {
  const user = await authRepository.findUserByEmail(email, "employee");
  if (!user) throw new Error("NOT_FOUND_EMPLOYEE");

  const randomAccessCode = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
  await authRepository.updateAccessCode(user, randomAccessCode);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"HANH TRAN TEST GOOGLE SERVICES" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "MÃ TRUY CẬP ĐĂNG NHẬP NHÂN VIÊN",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px;">
        <h3 style="color: #007bff;">Xác thực tài khoản nhân viên</h3>
        <p>Mã Access Code dùng để đăng nhập là:</p>        
        <p><strong>${randomAccessCode}</strong></p>
        <p style="font-size: 12px; color: #6c757d; margin-top: 15px;">Mã có hiệu lực ngắn hạn. Tuyệt đối không chia sẻ mã này cho người khác.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return {
    success: true,
    email: user.email,
  };
};

export const processCheckEmailAccessCode = async (email, accessCode) => {
  const user = await authRepository.findUserByEmail(email, "employee");
  if (!user) throw new Error("NOT_FOUND_EMPLOYEE");

  if (user.accessCode !== accessCode) throw new Error("INVALID_ACCESS_CODE");

  await authRepository.updateAccessCode(user, "");
  const fbToken = await createJWT(user);

  const userResponse = { ...user };
  delete userResponse.password;
  delete userResponse.accessCode;

  return { user: userResponse, loginToken: fbToken };
};