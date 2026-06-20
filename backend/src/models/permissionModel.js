import mongoose from "mongoose";

const authListSchema = new mongoose.Schema({
  action: { type: String, required: true, unique: true },     
  description: { type: String, required: true },                  
  allowedRoles: [{ type: String, enum: ["owner", "employee"] }] 
});

export default mongoose.model("AuthList", authListSchema);