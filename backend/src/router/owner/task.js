import express from "express";
import { ownerDeleteTask, ownerGetAllTasks, ownerGetTaskDetails, ownerUpdateTask,ownerCreateTask } from "../../controllers/owner/task.js";
const taskRouter = express.Router();

taskRouter.get("/get-all", ownerGetAllTasks);

taskRouter.get("/get-details/:id", ownerGetTaskDetails);

taskRouter.put("/update/:id", ownerUpdateTask);

taskRouter.delete("/delete/:id", ownerDeleteTask);

taskRouter.post("/create", ownerCreateTask);

export default taskRouter;
