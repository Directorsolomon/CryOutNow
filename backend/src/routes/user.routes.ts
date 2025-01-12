import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import * as userController from '../controllers/userController';
import { AppError } from '../middleware/error.middleware';


const router = Router();

router.get('/profile', auth, async (req, res, next) => {
  try {
    await userController.getProfile(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', auth, async (req, res, next) => {
  try {
    await userController.updateProfile(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/settings', auth, async (req, res, next) => {
  try {
    await userController.getSettings(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put('/settings', auth, async (req, res, next) => {
  try {
    await userController.updateSettings(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/activity', auth, async (req, res, next) => {
  try {
    await userController.getActivity(req, res, next);
  } catch (error) {
    next(error);
  }
});


export default router;