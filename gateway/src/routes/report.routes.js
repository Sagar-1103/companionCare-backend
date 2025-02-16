import Router from "express";
import { getReportForDoctor, getReportForPatient, storeReports } from "../controllers/report.controller.js";

const router  = Router();

router.route("/store").post(storeReports);
router.route("/patient").get(getReportForPatient);
router.route("/doctor").get(getReportForDoctor);


export default router;