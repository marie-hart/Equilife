import { Router } from 'express';
import horseController from '../controllers/horseController';
import { upload } from '../config/upload';

const router = Router();

router.get('/', horseController.getAll.bind(horseController));
router.get('/first', horseController.getFirst.bind(horseController));
router.get('/:id', horseController.getById.bind(horseController));
router.post('/', horseController.create.bind(horseController));
router.put('/:id', horseController.update.bind(horseController));
router.post(
  "/:id/photo",
  upload.single("photo") as any,
  horseController.uploadPhoto.bind(horseController)
);
router.delete('/:id', horseController.delete.bind(horseController));

export default router;
