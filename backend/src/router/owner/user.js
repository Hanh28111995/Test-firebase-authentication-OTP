import express from "express";
import { createUser, deleteUser, getAllUsers, getUserDetails, updateUser } from "../../controllers/owner/user.js";
import { signUpEmployee } from "../../controllers/auth.js";
const userRouter = express.Router();

userRouter.get("/get-all", getAllUsers);

userRouter.get("/get-details/:id", getUserDetails);

userRouter.put("/update/:id", updateUser);

userRouter.delete("/delete/:id", deleteUser);

userRouter.post("/create", createUser )

export default userRouter;
