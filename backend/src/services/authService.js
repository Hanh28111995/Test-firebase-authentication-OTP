import * as authRepository from "../repositories/authRepository.js";
import AuthList from "../models/permissionModel.js";
import { bucket, auth as firebaseAuth } from "../config/Firebase.js"; 
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import axios from "axios";
import { sendSuccess } from "../helper/response.js";
import crypto from "crypto";


const createJWT = async (user) => {
  const permissionsFromDB = await AuthList.find({ allowedRoles: user.role });
  const userPermissions = permissionsFromDB.map((item) => item.action);
  return jwt.sign(
    {
      userId: user._id,
      userName: user.userName,
      role: user.role,
      permissions: userPermissions,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "7d" },
  );
};

// LOGIC: SIGNIN OWNER (PHONE OTP AUTH)
export const processLoginPhone = async (phoneNumber) => { 
  try {
    console.log(
      "Khởi chạy processLoginPhone với SĐT:",
      phoneNumber,
    );    
    const user = await authRepository.findUserByPhone(phoneNumber, "owner");
    if (!user) throw new Error("User does not exist trong hệ thống.");
    
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "+84" + formattedPhone.slice(1);
    }    
    console.log("✅ SĐT hợp lệ, gửi lại cho FE xử lý tiếp:", formattedPhone);    
    return {
      success: true,
      phoneNumber: formattedPhone 
    };

  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

export const processCheckPhoneAccessCode = async (idToken) => {
  // Kiểm tra biến auth từ cấu hình Firebase Admin SDK đã khởi tạo chưa
  if (!firebaseAuth) {
    throw new Error("FIREBASE_NOT_INITIALIZED");
  }

  let decodedToken;
  try {
    // Xác thực token do Firebase cấp từ phía Client gửi lên
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

  const user = await authRepository.findUserByPhone(formattedPhone, "owner");
  if (!user) {
    throw new Error("DB_OWNER_NOT_MATCH");
  }

  await authRepository.updateAccessCode(user, decodedToken.uid);
  const fbToken = await createJWT(user);

  return { user, loginToken: fbToken };
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
  return user.email;
};

export const processCheckEmailAccessCode = async (email, accessCode) => {
  const user = await authRepository.findUserByEmail(email, "employee");
  if (!user) throw new Error("NOT_FOUND_EMPLOYEE");

  if (user.accessCode !== accessCode) throw new Error("INVALID_ACCESS_CODE");

  await authRepository.updateAccessCode(user, "");
  const fbToken = await createJWT(user);

  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.accessCode;

  return { user: userResponse, loginToken: fbToken };
};





