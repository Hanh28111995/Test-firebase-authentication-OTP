// backend/controllers/authController.js
import * as authService from "./../services/authService.js";
import {
  sendSuccess,
  sendError,
  sendServerError,
} from "./../helper/response.js";
import User from "../models/userModel.js";

//Owner yêu cầu gửi mã OTP qua SMS
export const loginPhone = async (req, res) => {
  try {
    const { phoneNumber, recapchaToken } = req.body;
    if (!phoneNumber) {
      return sendError(res, "Số điện thoại là bắt buộc");
    }
    const result = await authService.processLoginPhone(
      phoneNumber,
      recapchaToken,
    );
    return sendSuccess(res, "Xác thực user thành công", result);
  } catch (error) {
    return sendServerError(res);
  }
};

//Owner xác thực OTP Firebase và lấy Token hệ thống

export const checkPhoneAccessCode = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return sendError(res, "idToken từ Firebase là bắt buộc");
    }

    const result = await authService.processCheckPhoneAccessCode(idToken);
    return sendSuccess(
      res,
      "Chủ cửa hàng (Owner) đăng nhập thành công",
      result,
    );
  } catch (error) {
    return sendServerError(res);
  }
};

//Employee yêu cầu gửi mã OTP qua Email
export const loginEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, "Email là bắt buộc");
    }

    const result = await authService.processLoginEmail(email);
      return sendSuccess(res, "Xác thực user thành công", result);
  } catch (error) {
    return sendServerError(res);
  }
};

//Employee xác thực mã OTP Email và lấy Token hệ thống
export const checkEmailAccessCode = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return sendError(res, "Email và mã truy cập là bắt buộc");
    }

    const result = await authService.processCheckEmailAccessCode(
      email,
      otp
    );
    return sendSuccess(
      res,
      "Nhân viên (Employee) đăng nhập thành công",
      result,
    );
  } catch (error) {
    console.error("Error in checkEmailAccessCode controller:", error.message);

    if (error.message === "INVALID_ACCESS_CODE") {
      return res
        .status(401)
        .json({ success: false, message: "Mã truy cập không chính xác" });
    }
    return sendServerError(res);
  }
};

export const signUpEmployee = async (req, res) => {
  try {
    const { userName, phoneNumber, email, department, role, address } =
      req.body;

    const bodyData = {
      userName,
      phoneNumber,
      email,
      department,
      role,
      address,
    };
    const result = await authService.processSignUpEmployee(bodyData);
    return sendSuccess(
      res,
      "Khởi tạo tài khoản nhân viên thành công. Vui lòng kiểm tra email để kích hoạt.",
      result,
    );
  } catch (error) {
    return sendServerError(res);
  }
};

export const activeAccount = async (req, res) => {
  try {
    const token = req.params.token || req.query.token;
    if (!token) {
      return sendError(
        res,
        "Mã kích hoạt không hợp lệ hoặc tài khoản đã được kích hoạt trước đó.",
      );
    }
    const user = await User.findOne({ accessCode: token.trim() });
    if (!user) {
      return sendError(
        res,
        "Mã kích hoạt không hợp lệ hoặc tài khoản đã được kích hoạt trước đó.",
      );
    }

    user.status = true;
    user.accessCode = "";
    await user.save();
    return sendSuccess(res, `Kích hoạt tài khoản ${user.userName} thành công!`);
  } catch (error) {
    return sendServerError(res);
  }
};
