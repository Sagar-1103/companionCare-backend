import { Router } from "express";
import { getRoomChats,createRoom } from "../controllers/chat.controller.js";

const router  = Router();

router.route("/:roomId").get(getRoomChats);
router.route("/create-room").post(createRoom);
export default router;