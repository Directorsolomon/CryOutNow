import { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/connection';
import { authenticate, isAuthenticated } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();

router.get('/me', authenticate, isAuthenticated, async (req, res) => {
  const user = await db('users')
    .where({ id: req.user.id })
    .select('id', 'email', 'display_name', 'photo_url')
    .first();
  res.json(user);
});

router.patch('/me', authenticate, isAuthenticated, async (req, res, next) => {
  try {
    const { displayName, photoURL, password } = req.body;
    const updates: any = {};

    if (displayName) updates.display_name = displayName;
    if (photoURL) updates.photo_url = photoURL;
    if (password) {
      updates.password_hash = await bcrypt.hash(password, 10);
    }

    const [user] = await db('users')
      .where({ id: req.user.id })
      .update(updates)
      .returning(['id', 'email', 'display_name', 'photo_url']);

    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete('/me', authenticate, isAuthenticated, async (req, res, next) => {
  try {
    await db('users').where({ id: req.user.id }).delete();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticate, isAuthenticated, async (req, res, next) => {
  try {
    const user = await db('users')
      .where({ id: req.params.id })
      .select('id', 'display_name', 'photo_url')
      .first();

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router; 