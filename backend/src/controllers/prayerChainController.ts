import { Request, Response } from 'express';
import { PrayerChain } from '../models/PrayerChain';
import { ChainParticipant } from '../models/ChainParticipant';
import { ChainPrayer } from '../models/ChainPrayer';
import { transaction } from 'objection';

export const prayerChainController = {
  // Create a new prayer chain
  async create(req: Request, res: Response) {
    try {
      const { title, description, max_participants, turn_duration_days } = req.body;
      const creator_id = req.user!.id;

      const chain = await transaction(PrayerChain.knex(), async (trx) => {
        // Create the chain
        const newChain = await PrayerChain.query(trx).insert({
          title,
          description,
          creator_id,
          max_participants,
          turn_duration_days
        });

        // Add creator as first participant
        await ChainParticipant.query(trx).insert({
          chain_id: newChain.id,
          user_id: creator_id,
          turn_order: 0
        });

        return newChain;
      });

      res.status(201).json(chain);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create prayer chain' });
    }
  },

  // Join a prayer chain
  async join(req: Request, res: Response) {
    try {
      const { chainId } = req.params;
      const userId = req.user!.id;

      const chain = await PrayerChain.query()
        .findById(chainId)
        .withGraphFetched('participants');

      if (!chain) {
        return res.status(404).json({ error: 'Prayer chain not found' });
      }

      if (!chain.is_active) {
        return res.status(400).json({ error: 'Prayer chain is no longer active' });
      }

      const activeParticipants = chain.participants?.filter(p => p.is_active) || [];
      if (activeParticipants.length >= chain.max_participants) {
        return res.status(400).json({ error: 'Prayer chain is full' });
      }

      if (activeParticipants.some(p => p.user_id === userId)) {
        return res.status(400).json({ error: 'Already a participant' });
      }

      const participant = await ChainParticipant.query().insert({
        chain_id: chainId,
        user_id: userId,
        turn_order: activeParticipants.length
      });

      res.status(200).json(participant);
    } catch (error) {
      res.status(500).json({ error: 'Failed to join prayer chain' });
    }
  },

  // Submit a prayer in the chain
  async pray(req: Request, res: Response) {
    try {
      const { chainId } = req.params;
      const { prayer_text } = req.body;
      const userId = req.user!.id;

      const chain = await PrayerChain.query().findById(chainId);
      if (!chain) {
        return res.status(404).json({ error: 'Prayer chain not found' });
      }

      const isUsersTurn = await chain.isUsersTurn(userId);
      if (!isUsersTurn) {
        return res.status(400).json({ error: 'Not your turn to pray' });
      }

      await transaction(PrayerChain.knex(), async (trx) => {
        // Record the prayer
        await ChainPrayer.query(trx).insert({
          chain_id: chainId,
          user_id: userId,
          prayer_text
        });

        // Update participant's last prayer time
        await ChainParticipant.query(trx)
          .where({ chain_id: chainId, user_id: userId })
          .patch({ last_prayer_at: new Date() });
      });

      res.status(200).json({ message: 'Prayer submitted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit prayer' });
    }
  },

  // Get chain details with participants and recent prayers
  async getDetails(req: Request, res: Response) {
    try {
      const { chainId } = req.params;
      
      const chain = await PrayerChain.query()
        .findById(chainId)
        .withGraphFetched('[creator, participants.user, prayers.user]')
        .modifyGraph('prayers', builder => {
          builder.orderBy('prayed_at', 'desc').limit(10);
        });

      if (!chain) {
        return res.status(404).json({ error: 'Prayer chain not found' });
      }

      const currentParticipant = await chain.getCurrentParticipant();
      
      res.status(200).json({
        ...chain,
        currentParticipant
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get chain details' });
    }
  },

  // List all active chains
  async list(req: Request, res: Response) {
    try {
      const chains = await PrayerChain.query()
        .where('is_active', true)
        .withGraphFetched('[creator, participants]')
        .orderBy('created_at', 'desc');

      res.status(200).json(chains);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list prayer chains' });
    }
  },

  // Leave a prayer chain
  async leave(req: Request, res: Response) {
    try {
      const { chainId } = req.params;
      const userId = req.user!.id;

      const participant = await ChainParticipant.query()
        .where({ chain_id: chainId, user_id: userId, is_active: true })
        .first();

      if (!participant) {
        return res.status(404).json({ error: 'Not a participant in this chain' });
      }

      await participant.leave();

      res.status(200).json({ message: 'Left prayer chain successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to leave prayer chain' });
    }
  }
}; 