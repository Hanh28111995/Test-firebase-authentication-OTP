import { request } from "../configs/axios";


const createTaskApi = (role, data) => {
  return request({
    url: `/api/${role}/task/create`,
    method: "POST",
    data,
  });
};

const getAllTasksApi = (role) => {
  return request({
    url: `/api/${role}/task/get-all`,
    method: "GET",
  });
};
const getTaskDetailsApi = (role,id) => {
  return request({
    url: `/api/${role}/task/get-details/${id}`,
    method: "GET",
  });
};

const updateTaskApi = (role, id, data) => {
  return request({
    url: `/api/${role}/task/update/${id}`,
    method: "PUT",
    data,
  });
};

const deleteTaskApi = (role,id) => {
  return request({
    url: `/api/${role}/task/delete/${id}`,
    method: "DELETE",
  });
};


export {
createTaskApi,
getAllTasksApi,
getTaskDetailsApi,
updateTaskApi,
deleteTaskApi
};
