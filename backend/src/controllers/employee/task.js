import {
  sendSuccess,
  sendError,
  sendServerError,
} from "../../helper/response.js";
import * as taskService from "./../../services/taskService.js";

export const employeeGetAllTasks = async (req, res) => {
  try {
    const employeeId = req.user._id;

    const tasks = await taskService.employeeGetAllTasks(employeeId);
    return sendSuccess(res, "Danh sách nhiệm vụ", tasks);
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};

export const employeeGetTaskDetails = async (req, res) => {
  try {
    const taskId = req.params.id;
    const employeeId = req.user._id;

    const task = await taskService.employeeGetTaskDetails(taskId, employeeId);
    return sendSuccess(res, "Thông tin nhiệm vụ", task);
  } catch (error) {
    console.error(error);
    if (error.message === "TASK_NOT_FOUND") {
      return sendError(res, "Nhiệm vụ không tồn tại");
    }
    if (error.message === "FORBIDDEN_ACCESS") {
      return sendError(res, "Bạn không có quyền xem thông tin nhiệm vụ này");
    }
    return sendServerError(res);
  }
};

export const employeeUpdateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const employeeId = req.user._id;
    const updateData = req.body;

    const updatedTask = await taskService.employeeUpdateTask(
      taskId,
      employeeId,
      updateData,
    );
    return sendSuccess(
      res,
      "Cập nhật thông tin nhiệm vụ thành công",
      updatedTask,
    );
  } catch (error) {
    console.error(error);

    if (error.message === "TASK_NOT_FOUND") {
      return sendError(res, "Nhiệm vụ không tồn tại");
    }
    if (error.message === "FORBIDDEN_ACTION") {
      return sendError(res, "Bạn không có quyền cập nhật nhiệm vụ này");
    }
    return sendServerError(res);
  }
};

export const employeeDeleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const employeeId = req.user._id;

    await taskService.employeeDeleteTask(taskId, employeeId);
    return sendSuccess(res, "Xóa nhiệm vụ thành công");
  } catch (error) {
    console.error(error);

    if (error.message === "TASK_NOT_FOUND") {
      return sendError(res, "Nhiệm vụ không tồn tại");
    }
    if (error.message === "FORBIDDEN_ACTION") {
      return sendError(res, "Bạn không có quyền xóa nhiệm vụ này");
    }
    return sendServerError(res);
  }
};

export const employeeCreateTask = async (req, res) => {
  try {
    const {
      projectName,
      title,
      description,
      priority,
      status,
      startDate,
      endDate,
      shift,
      members,
    } = req.body;

    if (!projectName) {
      return sendError(res, "Tên dự án (projectName) không được để trống");
    }
    if (!title) {
      return sendError(res, "Tiêu đề nhiệm vụ (title) không được để trống");
    }

    const taskData = {
      projectName,
      title,
      description: description || "",
      priority: priority || "Medium",
      status: status || "Todo",
      startDate: startDate || Date.now(),
      endDate: endDate || null,
      shift: shift || "",
      members: members || [],
    };
    const userId = req.user._id;
    const newTask = await taskService.createTask(taskData, userId);

    return sendSuccess(res, "Tạo nhiệm vụ thành công", newTask);
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};
