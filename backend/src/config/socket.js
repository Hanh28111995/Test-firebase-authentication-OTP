import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";

import dbMiddleware from "./src/config/db.js";
import ownerRouter from "./src/router/owner/index.js";
import employeeRouter from "./src/router/employee/index.js";
import AUTHRouter from "./src/router/auth.js";

import { initFirebase } from "./src/config/firebase.js";
import { activeAccount } from "./src/controllers/auth.js";
import { verifyToken, checkRole, verifyFireBaseOwner } from "./src/middlewares/authMiddleware.js";
import { initChatSocket } from "./src/socket/chat.js";

initFirebase();

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);

initChatSocket(server);

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

// Route HTTP APIs
app.put("/api/account-confirm", activeAccount);
app.use("/api/signin", AUTHRouter);
app.use("/api/signup", verifyToken, checkRole("owner"), AUTHRouter);
app.use("/api/owner", verifyToken, checkRole("owner"), verifyFireBaseOwner, ownerRouter);
app.use("/api/employee", verifyToken, checkRole("employee"), employeeRouter);

server.listen(PORT, () => {
  console.log(`Server đang vận hành ổn định tại port: ${PORT}`);
  console.log(`Tính năng Chat Real-time đã được tách riêng và sẵn sàng!`);
});

export default app;