import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  createPrayerRequest,
  getPrayerRequests,
  getPrayerRequest,
  updatePrayerRequest,
  deletePrayerRequest,
} from '../services/prayer.service';
import { AppError } from '../middleware/error.middleware';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PrayerRequest:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - userId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the prayer request
 *         title:
 *           type: string
 *           description: Title of the prayer request
 *         content:
 *           type: string
 *           description: Detailed content of the prayer request
 *         userId:
 *           type: string
 *           description: ID of the user who created the request
 *         status:
 *           type: string
 *           enum: [active, answered, archived]
 *           description: Current status of the prayer request
 *         prayerCount:
 *           type: integer
 *           description: Number of times others have prayed for this request
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PrayerRequestCreate:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the prayer request
 *         content:
 *           type: string
 *           description: Detailed content of the prayer request
 *     PrayerRequestUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated title of the prayer request
 *         content:
 *           type: string
 *           description: Updated content of the prayer request
 *         status:
 *           type: string
 *           enum: [active, answered, archived]
 *           description: Updated status of the prayer request
 */

/**
 * @swagger
 * /api/prayers:
 *   get:
 *     summary: Get all prayer requests
 *     tags: [Prayers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, answered, archived]
 *         description: Filter by prayer request status
 *     responses:
 *       200:
 *         description: List of prayer requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PrayerRequest'
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const requests = await getPrayerRequests();
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/prayers:
 *   post:
 *     summary: Create a new prayer request
 *     tags: [Prayers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrayerRequestCreate'
 *     responses:
 *       201:
 *         description: Prayer request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrayerRequest'
 *       401:
 *         description: Not authenticated
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', authenticateJWT, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const request = await createPrayerRequest({
      ...req.body,
      userId: req.user.id,
    });
    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/prayers/{id}:
 *   get:
 *     summary: Get a specific prayer request by ID
 *     tags: [Prayers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prayer request ID
 *     responses:
 *       200:
 *         description: Prayer request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrayerRequest'
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Prayer request not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authenticateJWT, async (req, res, next) => {
  try {
    const request = await getPrayerRequest(req.params.id);
    if (!request) {
      throw new AppError('Prayer request not found', 404);
    }
    res.json(request);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/prayers/{id}:
 *   put:
 *     summary: Update a prayer request
 *     tags: [Prayers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prayer request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrayerRequestUpdate'
 *     responses:
 *       200:
 *         description: Prayer request updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PrayerRequest'
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this prayer request
 *       404:
 *         description: Prayer request not found
 *       500:
 *         description: Server error
 */
router.put('/:id', authenticateJWT, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    const request = await updatePrayerRequest(req.params.id, req.user.id, {
      ...req.body,
    });
    res.json(request);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/prayers/{id}:
 *   delete:
 *     summary: Delete a prayer request
 *     tags: [Prayers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Prayer request ID
 *     responses:
 *       204:
 *         description: Prayer request deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this prayer request
 *       404:
 *         description: Prayer request not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', authenticateJWT, async (req, res, next) => {
  try {
    if (!req.user) {
      throw new AppError('User not authenticated', 401);
    }

    await deletePrayerRequest(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const prayerRouter = router; 