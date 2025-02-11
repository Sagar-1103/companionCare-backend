import Router from "express";
import { getGeoDetails, getSafeZoneStatus, setFallStatus, setLocation, setRadius } from "../controllers/geo.controller.js";

const router = Router();

router.route("/set-location/:patientId").post(setLocation);
router.route("/geo-details/:patientId").get(getGeoDetails);
router.route("/set-fall-status/:patientId").post(setFallStatus);
router.route("/safe-zone-status/:patientId").get(getSafeZoneStatus);
router.route("/set-radius/:patientId").post(setRadius);

export default router;