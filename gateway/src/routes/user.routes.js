import { Router } from "express";
import { getCurrentUser, loginPatient, loginUser, logoutUser, registerUser,registerPatient } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(registerUser);           // for caretakers,doctors,patients without caretaker
router.route("/login").post(loginUser);                 // for caretakers,doctors,patients without caretaker

router.route("/register-patient").post(registerPatient);// caretaker will register for the patient
router.route("/login-patient").post(loginPatient);      // for patients having caretakers
router.route("/logout").post(logoutUser);               // for every user
router.route("/current-user").get(getCurrentUser);      // for every user

export default router;
