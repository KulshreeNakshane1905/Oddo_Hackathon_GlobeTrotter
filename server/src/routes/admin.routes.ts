import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const adminController = new AdminController();

// All routes here require both authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/stats', adminController.getPlatformStats.bind(adminController));
router.get('/cities/top', adminController.getTopCities.bind(adminController));
router.get('/users', adminController.getAllUsers.bind(adminController));

export default router;
