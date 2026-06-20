import * as taskRepo from "../repositories/taskRepository.js";

export const createTask = async (taskData, ownerId) => {
  return await taskRepo.createNew({
    ...taskData,
    createdBy: ownerId,
  });
};

export const ownerGetAllTasks = async () => {
  return await taskRepo.findAll({}).populate("createdBy members", "userName email");
};

export const ownerGetTaskDetails = async (taskId) => {
  const task = await taskRepo.findById(taskId).populate(
    "createdBy members",
    "userName email",
  );
  if (!task) throw new Error("TASK_NOT_FOUND");
  return task;
};

export const ownerUpdateTask = async (taskId, updateData) => {
  const updatedTask = await taskRepo.updateById(
    taskId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
  if (!updatedTask) throw new Error("TASK_NOT_FOUND");
  return updatedTask;
};

export const ownerDeleteTask = async (taskId) => {
  const deletedTask = await taskRepo.deleteById(taskId);
  if (!deletedTask) throw new Error("TASK_NOT_FOUND");
  return deletedTask;
};

export const employeeGetAllTasks = async (employeeId) => {
  return await taskRepo.findAll({ members: employeeId }).populate(
    "createdBy members",
    "userName email",
  );
};

export const employeeGetTaskDetails = async (taskId, employeeId) => {
  const task = await taskRepo.findById(taskId).populate(
    "createdBy members",
    "userName email",
  );
  if (!task) throw new Error("TASK_NOT_FOUND");

  // Kiểm tra xem ID người dùng hiện tại có nằm trong mảng thành viên của task không
  const isMember = task.members.some(
    (member) => member._id.toString() === employeeId.toString(),
  );
  if (!isMember) throw new Error("FORBIDDEN_ACCESS");

  return task;
};

export const employeeUpdateTask = async (taskId, employeeId, updateData) => {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");  
  if (task.createdBy.toString() !== employeeId.toString()) {
    throw new Error("FORBIDDEN_ACTION");
  }
  return await taskRepo.updateById(
    taskId,
    { $set: updateData },
    { new: true, runValidators: true },
  );
};

export const employeeDeleteTask = async (taskId, employeeId) => {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");  
  if (task.createdBy.toString() !== employeeId.toString()) {
    throw new Error("FORBIDDEN_ACTION");
  }
  return await taskRepo.deleteById(taskId);
};
