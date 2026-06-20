import cors from "cors";
import express from "express";
import dbMiddleware from "./src/config/db.js";
import ownerRouter from "./src/router/owner/index.js";
import employeeRouter from "./src/router/employee/index.js";
import {
  verifyToken,
  checkPermission,
} from "./src/middlewares/authMiddleware.js";
import AUTHRouter from "./src/router/auth.js";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import { initFirebase } from "./src/config/Firebase.js";
initFirebase(); 

const PORT = process.env.PORT ;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(dbMiddleware);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/signin", AUTHRouter);
app.use(
  "/api/signup",
  verifyToken,
  checkPermission("CRUD_ALL_USERS"),
  AUTHRouter,
);
app.use(
  "/api/owner",
  verifyToken,
  checkPermission("CRUD_ALL_USERS") || checkPermission("CRUD_ALL_TASKS"),
  ownerRouter,
);
app.use(
  "/api/employee",
  verifyToken,
  checkPermission("CRUD_ONE_USER") || checkPermission("CRUD_ONE_TASKS"),
  employeeRouter,
);


app.listen(PORT, () => {
  console.log(`Server đang chạy cổng: http://localhost:${PORT}`);
});


export default app;
