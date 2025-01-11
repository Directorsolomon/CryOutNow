import { Router } from 'express';
import { db } from '../db/connection';
import { authenticate, isAuthenticated } from '../middleware/auth';
import { AppError } from '../middleware/error';

const router = Router();

// Create prayer request
router.post('/', authenticate, isAuthenticated, async (req, res, next) => {
  try {
    const { title, description, tags } = req.body;
    const [prayer] = await db('prayer_requests')
      .insert({
        user_id: req.user.id,
        title,
        description,
        tags,
      })
      .returning('*');

    res.status(201).json(prayer);
  } catch (error) {
    next(error);
  }
});

// Get all prayer requests with pagination
router.get('/', async (req, res, next) => {
  try {
    const { userId, status, tags, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const query = db('prayer_requests')
      .select(
        'prayer_requests.*',
        'users.display_name as user_display_name',
        'users.photo_url as user_photo_url'
      )
      .leftJoin('users', 'prayer_requests.user_id', 'users.id')
      .orderBy('prayer_requests.created_at', 'desc')
      .limit(Number(limit))
      .offset(offset);

    if (userId) query.where('prayer_requests.user_id', userId);
    if (status) query.where('prayer_requests.status', status);
    if (tags) query.whereRaw('prayer_requests.tags && ?', [tags]);

    const [prayers, [{ count }]] = await Promise.all([
      query,
      db('prayer_requests')
        .count()
        .where(query.clone().clearSelect()._statements[0].value),
    ]);

    res.json({
      prayers,
      pagination: {
        total: Number(count),
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(Number(count) / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get prayer request by ID
router.get('/:id', async (req, res, next) => {
  try {
    const prayer = await db('prayer_requests')
      .select(
        'prayer_requests.*',
        'users.display_name as user_display_name',
        'users.photo_url as user_photo_url'
      )
      .leftJoin('users', 'prayer_requests.user_id', 'users.id')
      .where('prayer_requests.id', req.params.id)
      .first();

    if (!prayer) {
      throw new AppError(404, 'Prayer request not found');
    }

    res.json(prayer);
  } catch (error) {
    next(error);
  }
});

// Update prayer request
router.patch('/:id', authenticate, isAuthenticated, async (req, res, next) => {
  try {
    const prayer = await db('prayer_requests')
      .where({ id: req.params.id })
      .first();

    if (!prayer) {
      throw new AppError(404, 'Prayer request not found');
    }

    if (prayer.user_id !== req.user.id) {
      throw new AppError(403, 'Not authorized to update this prayer request');
    }

    const { title, description, tags, status, answerNote } = req.body;
    const updates: any = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags) updates.tags = tags;
    if (status) {
      updates.status = status;
      if (status === 'answered') {
        updates.answered_at = new Date();
        updates.answer_note = answerNote;
      }
    }

    const [updatedPrayer] = await db('prayer_requests')
      .where({ id: req.params.id })
      .update(updates)
      .returning('*');

    res.json(updatedPrayer);
  } catch (error) {
    next(error);
  }
});

// Delete prayer request
router.delete('/:id', authenticate, isAuthenticated, async (req, res, next) => {
  try {
    const prayer = await db('prayer_requests')
      .where({ id: req.params.id })
      .first();

    if (!prayer) {
      throw new AppError(404, 'Prayer request not found');
    }

    if (prayer.user_id !== req.user.id) {
      throw new AppError(403, 'Not authorized to delete this prayer request');
    }

    await db('prayer_requests').where({ id: req.params.id }).delete();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Pray for a request
router.post('/:id/pray', authenticate, isAuthenticated, async (req, res, next) => {
  try {
    const prayer = await db('prayer_requests')
      .where({ id: req.params.id })
      .first();

    if (!prayer) {
      throw new AppError(404, 'Prayer request not found');
    }

    await db.transaction(async (trx) => {
      await trx('prayer_commitments').insert({
        user_id: req.user.id,
        prayer_request_id: req.params.id,
      });

      const [updatedPrayer] = await trx('prayer_requests')
        .where({ id: req.params.id })
        .increment('prayer_count', 1)
        .returning('*');

      res.json(updatedPrayer);
    });
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      next(new AppError(400, 'You have already prayed for this request'));
    } else {
      next(error);
    }
  }
});

export default router; 