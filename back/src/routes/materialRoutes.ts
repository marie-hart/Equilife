import { Router } from "express";
import materialController from "../controllers/materialController";

const router = Router();

router.get("/", materialController.getAll.bind(materialController));
router.get(
    "/due-for-purchase",
    materialController.getDueForPurchase.bind(materialController),
);
router.get("/:id", materialController.getById.bind(materialController));
router.post("/", materialController.create.bind(materialController));
router.put("/:id", materialController.update.bind(materialController));
router.delete("/:id", materialController.delete.bind(materialController));
router.post(
    "/:id/purchase",
    materialController.markAsPurchased.bind(materialController),
);

export default router;
