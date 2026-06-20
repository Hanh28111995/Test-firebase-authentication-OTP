import express from "express";
import userRouter from "./user.js";
import taskRouter from "./task.js";
const ownerRouter = express.Router();

ownerRouter.use("/user", userRouter);
ownerRouter.use("/task", taskRouter);

export default ownerRouter;
