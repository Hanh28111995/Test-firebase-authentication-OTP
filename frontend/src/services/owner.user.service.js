import { request } from "../configs/axios";

const createUserApi = (data) => {
  return request({
    url: `/api/owner/user/create`,
    method: "POST",
    data,
  });
};

const getAllUserApi = () => {
  return request({
    url: `/api/owner/user/get-all`,
    method: "GET",
  });
};
const getUserDetailsApi = (id) => {
  return request({
    url: `/api/owner/user/get-details/${id}`,
    method: "GET",
  });
};

const updateUserApi = (id, data) => {
  return request({
    url: `/api/owner/user/update/${id}`,
    method: "PUT",
    data,
  });
};

const deleteUserApi = (id) => {
  return request({
    url: `/api/owner/user/delete/${id}`,
    method: "DELETE",
  });
};

const confirmUserApi = (token) => {
  return request({
    url: `/api/account-confirm?token=${token}`,
    method: "PUT",
  });
};

export {
  createUserApi,
  getAllUserApi,
  getUserDetailsApi,
  updateUserApi,
  deleteUserApi,
  confirmUserApi,
};
