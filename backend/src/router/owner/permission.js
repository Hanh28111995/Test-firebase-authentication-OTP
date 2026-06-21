import express from "express";
const permissionRouter = express.Router();

permissionRouter.get("/get-all", ownerGetAllActions);

permissionRouter.put("/update/:id", ownerUpdateAction);

permissionRouter.delete("/delete/:id", ownerDeleteAction);

permissionRouter.post("/create", ownerCreateAction);

export default permissionRouter;
Action