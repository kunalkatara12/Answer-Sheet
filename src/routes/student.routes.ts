import { Router } from "express";
import { login, logout, signup } from "../controllers/student.controllers";
import { loginValidator, registerValidator, validate } from "../utils/validators.utils";
import { verifyToken } from "../utils/token.utils";

const studentRouter=Router();
studentRouter.post("/signup", validate(registerValidator) ,signup)
studentRouter.post("/login", validate(loginValidator) ,login)
studentRouter.post("/logout", verifyToken,logout)
export default studentRouter