import User from "../models/userModel.js";

export const findAll = async () => {
  return await User.find();
};

export const findById = async (id) => {
  return await User.findById(id);
};

export const create = async (userData) => {
  const newUser = new User(userData);
  return await newUser.save();
};

export const updateById = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteById = async (id) => {
  return await User.findByIdAndDelete(id);
};

export const findUserByEmailOrPhone = async (identifier) => {
  return await User.findOne({
    $or: [{ email: identifier?.email }, { phoneNumber: identifier?.phoneNumber }],
  });
};
