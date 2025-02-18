import { Router } from "express";
import { geminiChat, getChats } from "../controllers/aiChat.controller.js";

const router = Router();

router.post("/",geminiChat);
router.get("/:userId",getChats);

export default router;