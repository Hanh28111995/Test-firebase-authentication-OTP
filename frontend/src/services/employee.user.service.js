import { request } from "../configs/axios";

const getProfileApi = () => {
  return request({
    url: `/api/employee/user/get-details`,
    method: "GET",
  });
};

const updateProfileApi = (data) => {
  return request({
    url: `/api/employee/user/update`,
    method: "PUT",
    data,
  });
};

export { getProfileApi, updateProfileApi };
