import Router from "express";
import { getHealthDetails, setHealthDetails } from "../controllers/health.controller.js";

const router = Router();

router.route("/:patientId").get(getHealthDetails);
router.route("/:patientId").post(setHealthDetails);

export default router;