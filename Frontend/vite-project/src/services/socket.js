// import { io } from "socket.io-client";

// export const socket = io("http://localhost:5000", {
//   autoConnect: false,
//   withCredentials: true,
// });

import { io } from "socket.io-client";

export const socket = io("http://localhost:5000", {
  autoConnect: false,
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (error) => {
  console.log("Socket connection error:", error.message);
});