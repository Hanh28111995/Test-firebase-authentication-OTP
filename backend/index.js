import "dotenv/config";
import cors from "cors";
import express from "express";
import dbMiddleware from "./src/config/db.js";
import ownerRouter from "./src/router/owner/index.js";
import employeeRouter from "./src/router/employee/index.js";
import {
  verifyToken,  
  checkRole
} from "./src/middlewares/authMiddleware.js";
import AUTHRouter from "./src/router/auth.js";
import { initFirebase } from "./src/config/firebase.js";
import { activeAccount } from "./src/controllers/auth.js";
initFirebase(); 

const PORT = process.env.PORT ;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

app.use(dbMiddleware);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.put("/api/account-confirm", activeAccount);
app.use("/api/signin", AUTHRouter);
app.use(
  "/api/signup",
  verifyToken,
  checkRole("owner"),
  AUTHRouter,
);
app.use(
  "/api/owner",
  verifyToken,
  checkRole("owner"),
  ownerRouter,
);
app.use(
  "/api/employee",
  verifyToken,
  checkRole("employee"),
  employeeRouter,
);


app.listen(PORT, () => {
  console.log(`Server đang chạy cổng: http://localhost:${PORT}`);
});


export default app;
