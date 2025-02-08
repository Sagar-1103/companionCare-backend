import { Router } from "express";
import { logoutUser } from "../controllers/user/user.controller.js";
import { getCaretaker, loginCaretaker, registerCaretaker, registerPatientByCaretaker } from "../controllers/user/caretaker.controller.js";
import { getDoctor, loginDoctor, pairPatientToDoctor, registerDoctor } from "../controllers/user/doctor.controller.js";
import { getPatient, loginPatient, loginPatientOnCode, registerPatient } from "../controllers/user/patient.controller.js";

const router = Router();               

//Caretaker routes
router.route("/register-caretaker").post(registerCaretaker);
router.route("/register-patient-by-caretaker").post(registerPatientByCaretaker);
router.route("/login-caretaker").post(loginCaretaker);                 
router.route("/current-caretaker").get(getCaretaker);                 

//Doctor routes
router.route("/register-doctor").post(registerDoctor);
router.route("/login-doctor").post(loginDoctor);     
router.route("/current-doctor").get(getDoctor);                 
router.route("/pair-patient").post(pairPatientToDoctor);

//Patients
router.route("/current-patient").get(getPatient);

//Patient with caretaker routes
router.route("/login-code").post(loginPatientOnCode);

//Patient without caretaker routes
router.route("/register-patient").post(registerPatient);
router.route("/login-patient").post(loginPatient);

//all
router.route("/logout").post(logoutUser);

export default router;
