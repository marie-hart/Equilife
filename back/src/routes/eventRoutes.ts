import { Router } from 'express';
import eventController from '../controllers/eventController';

const router = Router();

router.get('/', eventController.getAll.bind(eventController));
router.get('/reminders', eventController.getReminders.bind(eventController));
router.get('/:id', eventController.getById.bind(eventController));
router.post('/', eventController.create.bind(eventController));
router.put('/:id', eventController.update.bind(eventController));
router.delete('/:id', eventController.delete.bind(eventController));

export default router;

