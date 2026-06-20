import * as User from "../repositories/userRepository.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const getProfile = async (employeeId) => {
  const employee = await User.findById(employeeId).select("-accessCode");
  if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");
  return employee;
};

export const updateProfile = async (employeeId, updateData) => {
  const updatedEmployee = await User.updateById(
    employeeId,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-accessCode");

  if (!updatedEmployee) throw new Error("EMPLOYEE_NOT_FOUND");
  return updatedEmployee;
};

export const ownerCreateEmployee = async (bodyData) => {
  const { userName, phoneNumber, role, email, department, address } = bodyData;

  // 1. Kiểm tra xem Email hoặc Số điện thoại đã tồn tại trong DB chưa
  const existedUser = await authRepository.findUserByEmailOrPhone(
    email,
    phoneNumber,
  );
  if (existedUser) {
    throw new Error("EMAIL_OR_PHONE_ALREADY_EXISTS");
  }

  const activationToken = crypto.randomBytes(32).toString("hex");
  await authRepository.createUser({
    userName,
    phoneNumber,
    role,
    email,
    department,
    address,
    accessCode: activationToken,
  });

  const activationLink = `http://localhost:5173/activate-account?token=${activationToken}`;

  // 5. Cấu hình gửi Mail bằng Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Kích hoạt tài khoản nhân viên mới hệ thống ORMS",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2f7cf6; text-align: center;">Kích hoạt tài khoản của bạn</h2>
        <p>Chào <strong>${userName}</strong>,</p>
        <p>Tài khoản nhân viên của bạn đã được khởi tạo. Vui lòng nhấn vào nút bên dưới để xác thực email và kích hoạt tài khoản:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${activationLink}" style="background-color: #2f7cf6; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
            Kích Hoạt Tài Khoản
          </a>
        </div>        
        <p style="color: #777; font-size: 13px;">Hoặc copy đường dẫn này nếu nút bấm không hoạt động: <br/> ${activationLink}</p>
        <p style="color: #777; font-size: 13px;">* Đường link này phục vụ cho việc kích hoạt tài khoản nhân viên mới.</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
  console.log(`Đã gửi mail kèm link kích hoạt thành công tới: ${email}`);
  return {
    _id: newEmployee?._id,
    email,
    userName,
    department,
    isActived: false,
  };
};

export const ownerGetAllEmployees = async () => {
  return await User.findAll().select("-accessCode");
};

export const ownerUpdateEmployee = async (employeeId, updateData) => {
  const updatedEmployee = await User.updateById(
    employeeId,
    { $set: updateData },
    { new: true, runValidators: true },
  ).select("-accessCode");

  if (!updatedEmployee) throw new Error("EMPLOYEE_NOT_FOUND");
  return updatedEmployee;
};

export const ownerDeleteEmployee = async (employeeId) => {
  const deletedEmployee = await User.deleteById(employeeId);
  if (!deletedEmployee) throw new Error("EMPLOYEE_NOT_FOUND");
  return deletedEmployee;
};
