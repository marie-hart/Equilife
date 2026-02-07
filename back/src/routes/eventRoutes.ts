import { Router } from "express";
import eventController from "../controllers/eventController";

const router = Router();

// 1. Les routes spécifiques d'abord
router.get("/reminders", eventController.getReminders.bind(eventController));

// 2. Les routes avec paramètres spécifiques
router.get("/horses/:id/reminders", eventController.getReminders.bind(eventController));

// 3. Les autres routes
router.get("/", eventController.getAll.bind(eventController));
router.get("/:id", eventController.getById.bind(eventController));                

router.post("/", eventController.create.bind(eventController));
router.put("/:id", eventController.update.bind(eventController));
router.delete("/:id", eventController.delete.bind(eventController));

export default router;
