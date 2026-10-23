import { io, Socket } from "socket.io-client";

// The API is served under /api, but Socket.IO attaches directly to the
// HTTP server root, so strip the trailing /api before connecting.
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SOCKET_URL = apiUrl.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }

  return socket;
};

export const connectSocket = (): Socket => {
  const instance = getSocket();
  if (!instance.connected) instance.connect();
  return instance;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};
