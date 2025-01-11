import { Router } from 'express';
import { getUserById, updateUser, deleteUser } from '../services/user.service';
import { authenticate } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Get current user
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Update current user
router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { displayName, photoURL, password } = req.body;
    const updatedUser = await updateUser(req.user.id, {
      displayName,
      photoURL,
      password,
    });
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Delete current user
router.delete('/me', authenticate, async (req, res, next) => {
  try {
    await deleteUser(req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Get user by ID (public profile)
router.get('/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }
    const { password, email, ...publicProfile } = user;
    res.json(publicProfile);
  } catch (error) {
    next(error);
  }
});

export const userRouter = router; 