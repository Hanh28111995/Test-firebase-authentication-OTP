import {
  sendSuccess,
  sendError,
  sendServerError,
} from "../../helper/response.js";
import * as userService from "../../services/userService.js";

export const getEmployeeProfile = async (req, res) => {
  try {    
    const employeeId = req.user._id || req.user.id;    
    const user = await userService.getProfile(employeeId);
    return sendSuccess(res, "Thông tin người dùng cá nhân", user);
  } catch (error) {
    if (error.message === "EMPLOYEE_NOT_FOUND") {
      return sendError(res, "Người dùng không tồn tại");
    }
    return sendServerError(res, "Lỗi máy chủ khi lấy thông tin người dùng");
  }
};

export const updateEmployeeDetails = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const updateData = req.body;
    const updatedUser = await userService.updateProfile(
      employeeId,
      updateData,
    );
    return sendSuccess(
      res,
      "Cập nhật thông tin người dùng thành công",
      updatedUser,
    );
  } catch (error) {
    if (error.message === "EMPLOYEE_NOT_FOUND") {
      return sendError(res, "Người dùng không tồn tại hoặc cập nhật thất bại");
    }
    return sendServerError(res);
  }
};
