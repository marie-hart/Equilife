import { Router } from "express";
import authController from "../controllers/authController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/register", authController.register.bind(authController));
router.post("/login", authController.login.bind(authController));
router.get("/status", authController.status.bind(authController));
router.get("/me", requireAuth, authController.me.bind(authController));
router.post(
    "/change-password",
    requireAuth,
    authController.changePassword.bind(authController),
);

export default router;
