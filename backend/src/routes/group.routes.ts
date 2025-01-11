import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import { PrayerGroup } from '../models/PrayerGroup';
import { GroupMember } from '../models/GroupMember';
import { GroupSession } from '../models/GroupSession';
import { GroupPrayerRequest } from '../models/GroupPrayerRequest';
import { AppError } from '../middleware/error.middleware';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    privacy: z.enum(['public', 'private', 'invite_only']),
    max_members: z.number().min(1).max(1000).optional()
  })
});

const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    privacy: z.enum(['public', 'private', 'invite_only']).optional(),
    max_members: z.number().min(1).max(1000).optional(),
    is_active: z.boolean().optional()
  })
});

const createSessionSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(255),
    description: z.string().optional(),
    scheduled_time: z.string().datetime(),
    duration_minutes: z.number().min(1),
    type: z.enum(['video', 'audio', 'text']),
    meeting_link: z.string().optional()
  })
});

// Group Routes
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const groups = await PrayerGroup.query()
      .where(builder => {
        builder
          .where('privacy', 'public')
          .orWhere('creator_id', req.user!.id)
          .orWhereExists(
            GroupMember.query()
              .where('user_id', req.user!.id)
              .whereRaw('group_members.group_id = prayer_groups.id')
          );
      })
      .withGraphFetched('[creator, members.user]');
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateJWT, validateRequest(createGroupSchema), async (req, res, next) => {
  try {
    const group = await PrayerGroup.query().insert({
      ...req.body,
      creator_id: req.user!.id
    });

    // Add creator as admin member
    await group.addMember(req.user!.id, 'admin');

    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const group = await PrayerGroup.query()
      .findById(req.params.id)
      .withGraphFetched('[creator, members.user, sessions.[creator, participants], prayerRequests.user]');

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    // Check access permission
    if (group.privacy !== 'public') {
      const isMember = await group.isMember(req.user!.id);
      if (!isMember && group.creator_id !== req.user!.id) {
        throw new AppError('Not authorized to view this group', 403);
      }
    }

    res.json(group);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateJWT, validateRequest(updateGroupSchema), async (req, res, next) => {
  try {
    const group = await PrayerGroup.query().findById(req.params.id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    if (group.creator_id !== req.user!.id) {
      throw new AppError('Not authorized to update this group', 403);
    }

    const updatedGroup = await PrayerGroup.query()
      .patchAndFetchById(req.params.id, req.body);

    res.json(updatedGroup);
  } catch (error) {
    next(error);
  }
});

// Member Management Routes
router.post('/:id/members', authenticateJWT, async (req, res, next) => {
  try {
    const group = await PrayerGroup.query().findById(req.params.id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const member = await group.addMember(req.user!.id);
    res.status(201).json(member);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id/members/:userId', authenticateJWT, async (req, res, next) => {
  try {
    const group = await PrayerGroup.query().findById(req.params.id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const userRole = await group.getMemberRole(req.user!.id);
    if (!userRole || (userRole !== 'admin' && req.params.userId !== req.user!.id)) {
      throw new AppError('Not authorized to remove members', 403);
    }

    await group.removeMember(req.params.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Session Routes
router.post('/:id/sessions', authenticateJWT, validateRequest(createSessionSchema), async (req, res, next) => {
  try {
    const group = await PrayerGroup.query().findById(req.params.id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const isMember = await group.isMember(req.user!.id);
    if (!isMember && group.creator_id !== req.user!.id) {
      throw new AppError('Not authorized to create sessions', 403);
    }

    const session = await GroupSession.query().insert({
      ...req.body,
      group_id: group.id,
      creator_id: req.user!.id
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/sessions/:sessionId/join', authenticateJWT, async (req, res, next) => {
  try {
    const session = await GroupSession.query().findById(req.params.sessionId);
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    const group = await PrayerGroup.query().findById(req.params.id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const isMember = await group.isMember(req.user!.id);
    if (!isMember && group.creator_id !== req.user!.id) {
      throw new AppError('Not authorized to join sessions', 403);
    }

    const participant = await session.addParticipant(req.user!.id);
    res.status(201).json(participant);
  } catch (error) {
    next(error);
  }
});

// Prayer Request Routes
router.post('/:id/prayer-requests', authenticateJWT, async (req, res, next) => {
  try {
    const group = await PrayerGroup.query().findById(req.params.id);
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const isMember = await group.isMember(req.user!.id);
    if (!isMember && group.creator_id !== req.user!.id) {
      throw new AppError('Not authorized to create prayer requests', 403);
    }

    const prayerRequest = await GroupPrayerRequest.query().insert({
      ...req.body,
      group_id: group.id,
      user_id: req.user!.id
    });

    res.status(201).json(prayerRequest);
  } catch (error) {
    next(error);
  }
});

export default router; 