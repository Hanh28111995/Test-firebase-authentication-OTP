import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    address: {
      type: String,      
      required: false,
      trim: true,
    },
    status: {
      type: Boolean,            
      required: true,
      default: false,      
    },

    role: {
      type: String,
      enum: ["owner", "employee"],
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    department: {
      type: String,
      unique: true,
      required: false,
      trim: true,
    },
    accessCode: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
