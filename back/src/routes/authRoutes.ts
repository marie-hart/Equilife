import { Router } from "express";
import authController from "../controllers/authController";

const router = Router();

router.post("/login", authController.login.bind(authController));
router.get("/status", authController.status.bind(authController));

export default router;
