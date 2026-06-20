import express from "express";
import userRouter from "./user.js";
import taskRouter from "./task.js";
const employeeRouter = express.Router();

employeeRouter.use("/user", userRouter);
employeeRouter.use("/task", taskRouter);

export default employeeRouter;
