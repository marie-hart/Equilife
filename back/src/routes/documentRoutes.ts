import express from "express";
import documentController from "../controllers/documentController";
import { documentUpload } from "../config/documentUpload";

const router = express.Router();

router.get("/", documentController.getAll.bind(documentController));
router.post(
  "/",
  documentUpload.single("file") as any,
  documentController.create.bind(documentController)
);
router.delete("/:id", documentController.delete.bind(documentController));

export default router;
