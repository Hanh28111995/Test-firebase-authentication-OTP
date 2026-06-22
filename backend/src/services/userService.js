import * as User from "../repositories/userRepository.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const getProfile = async (employeeId) => {
  const employee = await User.findById(employeeId);
  if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");
  return employee;
};

export const updateProfile = async (employeeId, updateData) => {
  const updatedEmployee = await User.updateById(employeeId, updateData);
  if (!updatedEmployee) throw new Error("EMPLOYEE_NOT_FOUND");
  return updatedEmployee;
};

export const employeeGetAllEmployees = async () => {
  const data = await User.findAll();
  const employeeList = data
    .filter((user) => user.role === "employee")
    .map((user) => ({
      _id: user._id,
      userName: user.userName,
    }));
  return employeeList;
};

export const ownerCreateEmployee = async (bodyData) => {
  const { userName, phoneNumber, role, email, address, status } = bodyData;

  // 1. Kiểm tra xem Email hoặc Số điện thoại đã tồn tại trong DB chưa
  const existedUser = await User.findUserByEmailOrPhone({
    email,
    phoneNumber,
  });
  if (existedUser) {
    throw new Error("EMAIL_OR_PHONE_ALREADY_EXISTS");
  }

  const activationToken = crypto.randomBytes(32).toString("hex");
  await User.create({
    userName,
    phoneNumber,
    role,
    email,
    address,
    status: status || false,
    accessCode: activationToken,
  });

  const activationLink = `${process.env.FRONT_END_URL}/active-account?token=${activationToken}`;

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
    subject: "Kích hoạt tài khoản nhân viên",
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
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
  console.log(`Đã gửi mail kèm link kích hoạt thành công tới: ${email}`);
  return {
    userName,
    isActived: false,
  };
};

export const ownerGetAllEmployees = async () => {
  return await User.findAll();
};

export const ownerUpdateEmployee = async (employeeId, updateData) => {
  const updatedEmployee = await User.updateById(employeeId, updateData);
  if (!updatedEmployee) throw new Error("EMPLOYEE_NOT_FOUND");
  return updatedEmployee;
};

export const ownerDeleteEmployee = async (employeeId) => {
  const deletedEmployee = await User.deleteById(employeeId);
  if (!deletedEmployee) throw new Error("EMPLOYEE_NOT_FOUND");
  return deletedEmployee;
};
