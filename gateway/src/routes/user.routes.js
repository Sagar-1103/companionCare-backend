import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);          
router.route("/login").post(loginUser);                 
router.route("/logout").post(logoutUser);               
router.route("/current-user").get(getCurrentUser);

export default router;
