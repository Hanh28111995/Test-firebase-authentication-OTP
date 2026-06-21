import express from "express";
import {     
  loginEmail,   
  loginPhone,
  checkPhoneAccessCode,
  checkEmailAccessCode,  
  activeAccount
} from "../controllers/auth.js"; 
import { validatePhone, validateMail } from "./../validate/forLogin.js"; 
import { validateSignup } from "./../validate/forSignUp.js";

const AUTHRouter = express.Router();

AUTHRouter.post("/create-phone-code", validatePhone, loginPhone);

AUTHRouter.post("/owner/validate-phone-code", checkPhoneAccessCode);

AUTHRouter.post("/create-email-code", validateMail, loginEmail);

AUTHRouter.post("/employee/validate-email-code", validateMail, checkEmailAccessCode);

export default AUTHRouter;