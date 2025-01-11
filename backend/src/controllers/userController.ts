import { Request, Response } from 'express';
import { User } from '../models/User';
import { PrayerRequest } from '../models/PrayerRequest';
import { PrayerChain } from '../models/PrayerChain';
import { z } from 'zod';

const updateProfileSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  avatar: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  preferences: z.object({
    emailNotifications: z.boolean(),
    prayerReminders: z.boolean(),
    chainTurnNotifications: z.boolean(),
    dailyDigest: z.boolean(),
  }),
});

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const validatedData = updateProfileSchema.parse(req.body);

    // Check if email is already taken by another user
    const existingUser = await User.query()
      .where('email', validatedData.email)
      .whereNot('id', userId)
      .first();

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    const updatedUser = await User.query()
      .patchAndFetchById(userId, {
        displayName: validatedData.displayName,
        email: validatedData.email,
        photoURL: validatedData.avatar,
        bio: validatedData.bio,
        preferences: validatedData.preferences,
      });

    res.json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const getProfileStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const [totalPrayers, prayerRequests, prayerChains] = await Promise.all([
      // Count total prayers (sum of prayer requests and chain participations)
      Promise.all([
        PrayerRequest.query().where('userId', userId).resultSize(),
        PrayerChain.query()
          .whereExists(
            PrayerChain.relatedQuery('participants')
              .where('userId', userId)
          )
          .resultSize(),
      ]).then(([requests, chains]) => requests + chains),
      // Count prayer requests
      PrayerRequest.query().where('userId', userId).resultSize(),
      // Count prayer chains
      PrayerChain.query()
        .whereExists(
          PrayerChain.relatedQuery('participants')
            .where('userId', userId)
        )
        .resultSize(),
    ]);

    res.json({
      totalPrayers,
      prayerRequests,
      prayerChains,
    });
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    res.status(500).json({ message: 'Failed to fetch profile stats' });
  }
}; 