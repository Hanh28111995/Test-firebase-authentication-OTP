import express from "express";
import { getEmployeeListbyEmployee, getEmployeeProfile, updateEmployeeDetails } from "../../controllers/employee/user.js";
const userRouter = express.Router();

userRouter.get("/get-details", getEmployeeProfile);

userRouter.put("/update", updateEmployeeDetails);

userRouter.get("/get-all-employees", getEmployeeListbyEmployee);


export default userRouter;
