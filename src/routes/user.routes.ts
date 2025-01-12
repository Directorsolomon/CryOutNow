
import { Router } from 'express';
import { 
  login,
  register,
  getProfile,
  updateProfile,
  deleteAccount
} from '../controllers/userController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
