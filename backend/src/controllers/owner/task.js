import {
  sendSuccess,
  sendError,
  sendServerError,
} from "../../helper/response.js";
import * as taskService from "../../services/taskService.js"; // 🌟 Chuyển sang gọi tầng Service của Task

export const ownerGetAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.ownerGetAllTasks();
    return sendSuccess(res, "Danh sách toàn bộ nhiệm vụ", tasks);
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};

export const ownerGetTaskDetails = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await taskService.ownerGetTaskDetails(taskId);
    return sendSuccess(res, "Thông tin chi tiết nhiệm vụ", task);
  } catch (error) {
    console.error(error);
    if (error.message === "TASK_NOT_FOUND") {
      return sendError(res, "Nhiệm vụ không tồn tại");
    }
    return sendServerError(res);
  }
};

export const ownerUpdateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updateData = req.body;
    const updatedTask = await taskService.ownerUpdateTask(taskId, updateData);
    return sendSuccess(
      res,
      "Cập nhật thông tin nhiệm vụ thành công",
      updatedTask,
    );
  } catch (error) {
    console.error(error);
    if (error.message === "TASK_NOT_FOUND") {
      return sendError(res, "Nhiệm vụ không tồn tại để cập nhật");
    }
    return sendServerError(res);
  }
};

export const ownerDeleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const deletedTask = await taskService.ownerDeleteTask(taskId);
    return sendSuccess(res, "Xóa nhiệm vụ thành công", deletedTask);
  } catch (error) {
    console.error(error);
    if (error.message === "TASK_NOT_FOUND") {
      return sendError(res, "Nhiệm vụ không tồn tại hoặc đã bị xóa");
    }
    return sendServerError(res);
  }
};

export const ownerCreateTask = async (req, res) => {
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

    if (!projectName)
      return sendError(res, "Tên dự án (projectName) không được để trống");
    if (!title)
      return sendError(res, "Tiêu đề nhiệm vụ (title) không được để trống");

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

    const ownerId = req.user._id;
    const newTask = await taskService.createTask(taskData, ownerId);
    return sendSuccess(res, "Tạo nhiệm vụ thành công", newTask);
  } catch (error) {
    console.error(error);
    return sendServerError(res);
  }
};
