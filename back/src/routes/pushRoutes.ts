import { Router } from "express";
import pushController from "../controllers/pushController";

const router = Router();

router.get("/public-key", pushController.getPublicKey.bind(pushController));
router.post("/subscribe", pushController.subscribe.bind(pushController));

export default router;
