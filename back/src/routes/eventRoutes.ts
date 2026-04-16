import { Router } from "express";
import eventController from "../controllers/eventController";
import { documentUpload } from "../config/documentUpload";

const router = Router();

// 1. Les routes spécifiques d'abord
router.get("/reminders", eventController.getReminders.bind(eventController));
router.get("/care-types", eventController.getCareTypes.bind(eventController));
router.post("/care-types", eventController.createCareType.bind(eventController));

// 2. Les routes avec paramètres spécifiques
router.get("/horses/:id/reminders", eventController.getReminders.bind(eventController));

// 3. Les autres routes
router.get("/", eventController.getAll.bind(eventController));
router.get("/:id", eventController.getById.bind(eventController));                

router.post("/", eventController.create.bind(eventController));
router.put("/:id", eventController.update.bind(eventController));
router.post(
    "/:id/attachment",
    documentUpload.single("file") as any,
    eventController.uploadAttachment.bind(eventController),
);
router.delete(
    "/:id/attachment",
    eventController.deleteAttachment.bind(eventController),
);
router.post("/:id/mark-done", eventController.markCareDone.bind(eventController));
router.delete("/:id", eventController.delete.bind(eventController));

export default router;
