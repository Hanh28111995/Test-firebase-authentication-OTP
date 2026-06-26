import { io } from "socket.io-client";
import { BASE_URL } from "../constants/common";

const SOCKET_URL = BASE_URL
let socket = null;

export const connectSocket = (token) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: {
        token: token 
      },
      autoConnect: false, 
    });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};