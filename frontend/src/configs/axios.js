import axios from "axios";
import { BASE_URL, USER_KEY } from "../constants/common";

export const request = axios.create({
  proxy: false,    
  baseURL: BASE_URL,
  withCredentials: true,
});

request.interceptors.request.use((config) => {  
  const savedData = localStorage.getItem(USER_KEY);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      const token = parsedData?.loginToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Lỗi parse token:", error);
    }
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  (error) => {
    console.log(error);
    return Promise.reject(error);
  }
);