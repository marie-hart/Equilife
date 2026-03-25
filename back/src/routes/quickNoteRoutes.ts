import { Router } from "express";
import quickNoteController from "../controllers/quickNoteController";

const router = Router();

router.get("/", quickNoteController.list.bind(quickNoteController));
router.post("/", quickNoteController.create.bind(quickNoteController));
router.patch("/:id", quickNoteController.update.bind(quickNoteController));
router.delete("/:id", quickNoteController.remove.bind(quickNoteController));

export default router;
