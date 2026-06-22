import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyAFGUg7TQD0X5IxRjM31FD57ANangSbmkY",
  authDomain: "taskmanagement-3b275.firebaseapp.com",
  projectId: "taskmanagement-3b275",
  storageBucket: "taskmanagement-3b275.firebasestorage.app",
  messagingSenderId: "1095631177395",
  appId: "1:1095631177395:web:41222b5e891cae7cedd2c6",
  measurementId: "G-F82QJ86KMJ"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);