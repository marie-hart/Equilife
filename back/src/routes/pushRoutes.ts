import { Router } from "express";
import pushController from "../controllers/pushController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/public-key", pushController.getPublicKey.bind(pushController));
router.post("/subscribe", requireAuth, pushController.subscribe.bind(pushController));

export default router;
