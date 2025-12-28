"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = __importDefault(require("../controllers/eventController"));
const router = (0, express_1.Router)();
router.get('/', eventController_1.default.getAll.bind(eventController_1.default));
router.get('/reminders', eventController_1.default.getUpcomingReminders.bind(eventController_1.default));
router.get('/:id', eventController_1.default.getById.bind(eventController_1.default));
router.post('/', eventController_1.default.create.bind(eventController_1.default));
router.put('/:id', eventController_1.default.update.bind(eventController_1.default));
router.delete('/:id', eventController_1.default.delete.bind(eventController_1.default));
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map