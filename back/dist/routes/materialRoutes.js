"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const materialController_1 = __importDefault(require("../controllers/materialController"));
const router = (0, express_1.Router)();
router.get('/', materialController_1.default.getAll.bind(materialController_1.default));
router.get('/due-for-purchase', materialController_1.default.getDueForPurchase.bind(materialController_1.default));
router.get('/:id', materialController_1.default.getById.bind(materialController_1.default));
router.post('/', materialController_1.default.create.bind(materialController_1.default));
router.put('/:id', materialController_1.default.update.bind(materialController_1.default));
router.delete('/:id', materialController_1.default.delete.bind(materialController_1.default));
router.post('/:id/purchase', materialController_1.default.markAsPurchased.bind(materialController_1.default));
exports.default = router;
//# sourceMappingURL=materialRoutes.js.map