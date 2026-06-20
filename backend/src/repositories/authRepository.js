import User from "../models/userModel.js";

export const findUserByPhone = async (phoneNumber, role) => {
  return await User.findOne({ phoneNumber, role });
};

export const findUserByEmail = async (email, role) => {
  return await User.findOne({ email, role });
};

export const updateAccessCode = async (userInstance, accessCode) => {
  userInstance.accessCode = accessCode;
  return await userInstance.save();
};