import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import {
  validateRegister,
  validateLogin,
} from '../middlewares/validation.middleware';

const router = Router();
const controller = new UserController();

router.post('/auth/register', validateRegister, controller.register);
router.post('/auth/login', validateLogin, controller.login);

router.get('/profile', authMiddleware, controller.getProfile);
router.get(
  '/profile/financial',
  authMiddleware,
  controller.getProfileWithFinancialData,
);
router.get('/users', authMiddleware, controller.getAllUsers);

export default router;
