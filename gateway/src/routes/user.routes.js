import { Router } from "express";
import { logoutUser, setPatientDiseases } from "../controllers/user/user.controller.js";
import { getCaretaker, loginCaretaker, registerCaretaker, registerPatientByCaretaker } from "../controllers/user/caretaker.controller.js";
import { getDoctor, getDoctorsPatients, loginDoctor, pairPatientToDoctor, registerDoctor } from "../controllers/user/doctor.controller.js";
import { getPatient, loginPatient, loginPatientOnCode, registerPatient } from "../controllers/user/patient.controller.js";

const router = Router();               

//Caretaker routes
router.route("/register-caretaker").post(registerCaretaker);
router.route("/register-patient-by-caretaker").post(registerPatientByCaretaker);
router.route("/login-caretaker").post(loginCaretaker);                 
router.route("/current-caretaker/:id").get(getCaretaker);                 

//Doctor routes
router.route("/register-doctor").post(registerDoctor);
router.route("/login-doctor").post(loginDoctor);     
router.route("/current-doctor/:id").get(getDoctor);                 
router.route("/pair-patient").post(pairPatientToDoctor);
router.route("/get-patients/:doctorId").get(getDoctorsPatients);

//Patients
router.route("/current-patient/:id").get(getPatient);

//Patient with caretaker routes
router.route("/login-code").post(loginPatientOnCode);

//Patient without caretaker routes
router.route("/register-patient").post(registerPatient);
router.route("/login-patient").post(loginPatient);

//all
router.route("/set-diseases/:patientId").post(setPatientDiseases);
router.route("/logout").post(logoutUser);

export default router;
