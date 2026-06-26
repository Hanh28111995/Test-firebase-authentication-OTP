import "dotenv/config";
import cors from "cors";
import express from "express";
import dbMiddleware from "./src/config/db.js";
import ownerRouter from "./src/router/owner/index.js";
import employeeRouter from "./src/router/employee/index.js";
import { verifyToken, checkRole, verifyFireBaseOwner } from "./src/middlewares/authMiddleware.js";
import AUTHRouter from "./src/router/auth.js";
import { initFirebase } from "./src/config/firebase.js";
import { activeAccount } from "./src/controllers/auth.js";
import { Server } from "socket.io";
import http from "http";
import { initChatSocket } from "./src/config/socket.js";
import ChatRouter from "./src/router/chat.js";
initFirebase();

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);
initChatSocket(server)

app.use(
  cors({
    origin: process.env.FRONT_END_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(dbMiddleware);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.put("/api/account-confirm", activeAccount);
app.use("/api/chat", ChatRouter);
app.use("/api/signin", AUTHRouter);
app.use("/api/signup", verifyToken, checkRole("owner"), AUTHRouter);
app.use("/api/owner", verifyToken, checkRole("owner"), verifyFireBaseOwner, ownerRouter);
app.use("/api/employee", verifyToken, checkRole("employee"), employeeRouter);

server.listen(PORT, () => {
  console.log(`=== Hệ thống vận hành ổn định ===`);
  console.log(`👉 API HTTP: http://localhost:${PORT}`);
  console.log(`👉 Chat Real-time (WS): Sẵn sàng kết nối thông qua HTTP Server này!`);
});

export default app;
