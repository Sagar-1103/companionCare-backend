import Router from "express";
import { generateReport, getReportForDoctor, getReportForPatient, storeReports } from "../controllers/report.controller.js";

const router  = Router();

router.route("/store").post(storeReports);
router.route("/generate").post(generateReport);
router.route("/patient").get(getReportForPatient);
router.route("/doctor").get(getReportForDoctor);


export default router;