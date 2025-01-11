import { Model } from 'objection';
import { User } from './User';
import { ChainParticipant } from './ChainParticipant';
import { ChainPrayer } from './ChainPrayer';

export class PrayerChain extends Model {
  id!: string;
  title!: string;
  description?: string;
  creator_id!: string;
  max_participants!: number;
  turn_duration_days!: number;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  creator?: User;
  participants?: ChainParticipant[];
  prayers?: ChainPrayer[];

  static get tableName() {
    return 'prayer_chains';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['title', 'creator_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string' },
        creator_id: { type: 'string', format: 'uuid' },
        max_participants: { type: 'integer', minimum: 2 },
        turn_duration_days: { type: 'integer', minimum: 1 },
        is_active: { type: 'boolean' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'prayer_chains.creator_id',
          to: 'users.id'
        }
      },
      participants: {
        relation: Model.HasManyRelation,
        modelClass: ChainParticipant,
        join: {
          from: 'prayer_chains.id',
          to: 'chain_participants.chain_id'
        }
      },
      prayers: {
        relation: Model.HasManyRelation,
        modelClass: ChainPrayer,
        join: {
          from: 'prayer_chains.id',
          to: 'chain_prayers.chain_id'
        }
      }
    };
  }

  // Helper methods
  async getCurrentParticipant(): Promise<ChainParticipant | null> {
    const participants = await this.$relatedQuery('participants')
      .orderBy('turn_order', 'asc')
      .where('is_active', true);
    
    if (!participants.length) return null;

    const lastPrayer = await this.$relatedQuery('prayers')
      .orderBy('prayed_at', 'desc')
      .first();

    if (!lastPrayer) return participants[0];

    const lastPrayerParticipant = participants.find(p => p.user_id === lastPrayer.user_id);
    if (!lastPrayerParticipant) return participants[0];

    const nextIndex = (participants.indexOf(lastPrayerParticipant) + 1) % participants.length;
    return participants[nextIndex];
  }

  async isUsersTurn(userId: string): Promise<boolean> {
    const currentParticipant = await this.getCurrentParticipant();
    return currentParticipant?.user_id === userId;
  }
} 