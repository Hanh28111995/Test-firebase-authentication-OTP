import express from "express";
import { getEmployeeProfile, updateEmployeeDetails } from "../../controllers/employee/user.js";
const userRouter = express.Router();

userRouter.get("/get-details", getEmployeeProfile);

userRouter.put("/update", updateEmployeeDetails);


export default userRouter;
