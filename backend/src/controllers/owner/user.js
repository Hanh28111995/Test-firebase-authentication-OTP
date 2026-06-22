import {
  sendSuccess,
  sendError,
  sendServerError,
} from "../../helper/response.js";
import * as userService from "../../services/userService.js";


export const createUser = async (req, res) => {
    try {
        const bodyData = req.body;         
        const result = await userService.ownerCreateEmployee(bodyData);
        return sendSuccess(
            res, 
            "Khởi tạo tài khoản nhân viên thành công. Vui lòng bảo nhân viên kiểm tra email kích hoạt.", 
            result
        );
    } catch (error) {        
        console.error(error)     
        if (error.message === "EMAIL_OR_PHONE_ALREADY_EXISTS") {
            return sendError(res, "Email hoặc số điện thoại đã tồn tại trên hệ thống");
        }        
        return sendServerError(res);
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.ownerGetAllEmployees();
        return sendSuccess(res, "Danh sách người dùng", users);
    } catch (error) {   
        console.error(error)     
        return sendServerError(res);
    }       
};

export const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getProfile(userId); // Gọi hàm lấy chi tiết từ service
        
        return sendSuccess(res, "Thông tin người dùng", user);
    } catch (error) {       
        console.error(error)         
        if (error.message === "EMPLOYEE_NOT_FOUND" || error.message === "USER_NOT_FOUND") {
            return sendError(res, "Người dùng không tồn tại");
        }
        return sendServerError(res);
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        const updatedUser = await userService.ownerUpdateEmployee(userId, updateData);        
        return sendSuccess(res, "Cập nhật thông tin người dùng thành công", updatedUser);
    } catch (error) {   
        console.error(error)             
        if (error.message === "EMPLOYEE_NOT_FOUND" || error.message === "USER_NOT_FOUND") {
            return sendError(res, "Người dùng không tồn tại để cập nhật");
        }
        return sendServerError(res);
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const deletedUser = await userService.ownerDeleteEmployee(userId);
        
        return sendSuccess(res, "Xóa người dùng thành công", deletedUser);
    } catch (error) {               
           console.error(error) 
        if (error.message === "EMPLOYEE_NOT_FOUND" || error.message === "USER_NOT_FOUND") {
            return sendError(res, "Người dùng không tồn tại hoặc đã bị xóa trước đó");
        }
        return sendServerError(res);
    }
};
