import * as taskRepo from "../repositories/taskRepository.js";
import { getDB } from "../config/firebase.js";

const populateTaskUsers = async (tasks) => {
  const db = getDB();
  if (!tasks || tasks.length === 0) return [];

  const isArray = Array.isArray(tasks);
  const taskList = isArray ? tasks : [tasks];

  const userIds = new Set();
  taskList.forEach((task) => {
    if (task.createdBy) userIds.add(task.createdBy);
    if (Array.isArray(task.members)) {
      task.members.forEach((id) => userIds.add(id));
    }
  });
  const userMap = {};
  if (userIds.size > 0) {
    const refs = Array.from(userIds).map((id) =>
      db.collection("users").doc(id).get(),
    );
    const docs = await Promise.all(refs);
    docs.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data();
        userMap[doc.id] = {
          _id: doc.id,
          userName: data.userName || "",
          email: data.email || "",
        };
      }
    });
  }

  const populated = taskList.map((task) => {
    return {
      ...task,
      createdBy: userMap[task.createdBy] || task.createdBy,
      members: Array.isArray(task.members)
        ? task.members.map((id) => userMap[id] || id)
        : [],
    };
  });

  return isArray ? populated : populated[0];
};

export const createTask = async (taskData, ownerId) => {
  return await taskRepo.createNew({
    ...taskData,
    createdBy: ownerId,
  });
};

export const ownerGetAllTasks = async () => {
  const tasks = await taskRepo.findAll({});
  return await populateTaskUsers(tasks);
};

export const ownerGetTaskDetails = async (taskId) => {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");
  return await populateTaskUsers(task);
};

export const ownerUpdateTask = async (taskId, updateData) => {
  const actualData = updateData.updateData ? updateData.updateData : updateData;
  const updatedTask = await taskRepo.updateById(taskId, actualData);
  if (!updatedTask) throw new Error("TASK_NOT_FOUND");
  return updatedTask;
};

export const ownerDeleteTask = async (taskId) => {
  const deletedTask = await taskRepo.deleteById(taskId);
  if (!deletedTask) throw new Error("TASK_NOT_FOUND");
  return deletedTask;
};

export const employeeGetAllTasks = async (employeeId) => {
  const tasks = await taskRepo.findAll({ members: employeeId });
  return await populateTaskUsers(tasks);
};

export const employeeGetTaskDetails = async (taskId, employeeId) => {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");
  const isMember =
    Array.isArray(task.members) && task.members.includes(employeeId);
  if (!isMember) throw new Error("FORBIDDEN_ACCESS");
  return await populateTaskUsers(task);
};

export const employeeUpdateTask = async (taskId, employeeId, updateData) => {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");

  if (task.createdBy !== employeeId) {
    throw new Error("FORBIDDEN_ACTION");
  }

  const actualData = updateData.updateData ? updateData.updateData : updateData;
  return await taskRepo.updateById(taskId, actualData);
};

export const employeeDeleteTask = async (taskId, employeeId) => {
  const task = await taskRepo.findById(taskId);
  if (!task) throw new Error("TASK_NOT_FOUND");

  if (task.createdBy !== employeeId) {
    throw new Error("FORBIDDEN_ACTION");
  }
  return await taskRepo.deleteById(taskId);
};
