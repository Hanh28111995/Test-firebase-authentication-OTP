import express from "express";
import { employeeCreateTask, employeeDeleteTask, employeeGetAllTasks, employeeGetTaskDetails, employeeUpdateTask } from "./../../controllers/employee/task.js";
const taskRouter = express.Router();

taskRouter.get("/get-all", employeeGetAllTasks);

taskRouter.get("/get-details/:id", employeeGetTaskDetails);

taskRouter.put("/update/:id", employeeUpdateTask);
    
taskRouter.delete("/delete/:id", employeeDeleteTask);

taskRouter.post("/create", employeeCreateTask);

export default taskRouter;
