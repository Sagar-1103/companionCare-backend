import Router from "express";
import { deleteMedication, getLogs, getMedications, getTime, setLog, setMedication, setTime, updateLog } from "../controllers/medication.controller.js";

const router  = Router();

router.route("/set-time/:patientId").post(setTime);
router.route("/get-time/:patientId").get(getTime);
router.route("/set-medication/:patientId").post(setMedication);
router.route("/delete-medication/:medicationId").post(deleteMedication);
router.route("/get-medications/:patientId").get(getMedications);


router.route("/set-log").post(setLog);
router.route("/read-logs/:patientId").get(getLogs);
router.route("/update-log").post(updateLog);

export default router;