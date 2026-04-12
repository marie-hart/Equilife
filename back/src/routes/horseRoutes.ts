import { Router } from "express";
import multer from "multer";
import horseController from "../controllers/horseController";
import { horsePhotoMaxMb, upload } from "../config/upload";

const router = Router();

router.get("/", horseController.getAll.bind(horseController));
router.get("/first", horseController.getFirst.bind(horseController));
router.get("/:id", horseController.getById.bind(horseController));
router.post("/", horseController.create.bind(horseController));
router.put("/:id", horseController.update.bind(horseController));
router.post("/:id/photo", (req, res, next) => {
    (upload.single("photo") as any)(req, res, (err: unknown) => {
        if (!err) {
            next();
            return;
        }
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                res.status(400).json({
                    error: `Image trop volumineuse (max ${horsePhotoMaxMb}MB)`,
                });
                return;
            }
            res.status(400).json({ error: err.message || "Fichier invalide" });
            return;
        }
        const e = err as Error;
        res.status(400).json({ error: e?.message || "Upload impossible" });
    });
}, horseController.uploadPhoto.bind(horseController));
router.delete("/:id", horseController.delete.bind(horseController));

export default router;
