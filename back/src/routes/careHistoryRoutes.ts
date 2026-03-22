import { Router } from "express";
import careHistoryController from "../controllers/careHistoryController";

const router = Router();
router.get("/", careHistoryController.getAll.bind(careHistoryController));

export default router;
