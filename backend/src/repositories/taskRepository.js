import Task from "../models/taskModel.js";

export const findAll = async (filter = {}) => {
  return await Task.find(filter);  
};

export const findByName = async (filter = {}) => {
  return await Task.find(filter);  
};

export const findById = async (id) => {
  return await Task.findById(id);
};
export const createNew = async (taskData) => {
    const newTask = new Task(taskData);
    return await newTask.save();
};
export const updateById = async (id, updateData) => {
  return await Task.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteById = async (id) => {
  return await Task.findByIdAndDelete(id);  
};