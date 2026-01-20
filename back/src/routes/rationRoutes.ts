import express from "express";
import rationController from "../controllers/rationController";

const router = express.Router();

router.get("/", rationController.getAll.bind(rationController));
router.get("/:id", rationController.getById.bind(rationController));
router.post("/", rationController.create.bind(rationController));
router.put("/:id", rationController.update.bind(rationController));
router.delete("/:id", rationController.delete.bind(rationController));

export default router;
