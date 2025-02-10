import Router from "express";
import { deleteMedication, getMedications, setMedication, setTime } from "../controllers/medication.controller.js";

const router  = Router();

router.route("/set-time/:patientId").post(setTime);
router.route("/set-medication/:patientId").post(setMedication);
router.route("/delete-medication/:medicationId").post(deleteMedication);
router.route("/get-medications/:patientId").get(getMedications);

export default router;