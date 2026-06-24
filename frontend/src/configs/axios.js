import axios from "axios";
import { BASE_URL, USER_KEY } from "../constants/common";
import { getAuth } from "firebase/auth";

export const request = axios.create({
  proxy: false,    
  baseURL: BASE_URL,
  withCredentials: true,
});

request.interceptors.request.use(async (config) => {  
  const savedData = localStorage.getItem(USER_KEY);
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);            
      const token = parsedData?.loginToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }    
      const auth = getAuth();
      
     const currentUser = await new Promise((resolve) => {
        // Nếu có user sẵn rồi thì lấy luôn
        if (auth.currentUser) return resolve(auth.currentUser);
        // Nếu chưa có, đợi thằng onAuthStateChanged phát tín hiệu (chỉ nghe 1 lần duy nhất để tránh rò rỉ bộ nhớ)
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
      });

      // Nếu sau khi đợi mà tìm thấy user, tiến hành lấy token đóng gói vào header
      if (currentUser) {        
        const firebaseRealtimeToken = await currentUser.getIdToken();
        if (firebaseRealtimeToken) {
          config.headers["firebase-token"] = firebaseRealtimeToken;
        }
      }
    } catch (error) {
      console.error("Lỗi xử lý gửi token bảo mật:", error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

request.interceptors.response.use(
  (response) => {
    return response.data; 
  },
  (error) => {
    console.log("Lỗi hệ thống trả về:", error);    
    if (      
      error.response.status === 403 
    ) {
      alert("Phiên làm việc không hợp lệ hoặc đã thay đổi thiết bị. Vui lòng đăng nhập lại!");            
      localStorage.removeItem(USER_KEY);            
      const auth = getAuth();
      auth.signOut();            
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);