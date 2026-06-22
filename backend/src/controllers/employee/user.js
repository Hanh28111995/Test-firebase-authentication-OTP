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
    console.error(error);    
    return sendServerError(res);
  }
};

export const updateEmployeeDetails = async (req, res) => {
  try {
    const employeeId = req.user._id || req.user.id;
    const updateData = req.body;
    const updatedUser = await userService.updateProfile(employeeId, updateData);
    return sendSuccess(
      res,
      "Cập nhật thông tin người dùng thành công",
      updatedUser,
    );
  } catch (error) {
    console.error(error);    
    return sendServerError(res);
  }
};

export const getEmployeeListbyEmployee = async (req, res) => {
  try{
  const userList = await userService.employeeGetAllEmployees();
  return sendSuccess(res, "Lấy danh sách nhân viên thành công", userList);
  }
  catch (error){
    console.error(error);    
    return sendServerError(res);
  }

};
