import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRegister, validateLogin } from '../middlewares/validation.middleware';

const router = Router();
const controller = new UserController();

// Public routes (no authentication required)
router.post('/auth/register', validateRegister, controller.register);
router.post('/auth/login', validateLogin, controller.login);

// Protected routes (authentication required)
router.get('/profile', authMiddleware, controller.getProfile);
router.get('/profile/financial', authMiddleware, controller.getProfileWithFinancialData);
router.get('/users', authMiddleware, controller.getAllUsers);

export default router;