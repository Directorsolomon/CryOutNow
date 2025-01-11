import { Model } from 'objection';
import { User } from './User';
import { PrayerChain } from './PrayerChain';

export class ChainParticipant extends Model {
  id!: string;
  chain_id!: string;
  user_id!: string;
  turn_order!: number;
  is_active!: boolean;
  last_prayer_at?: Date;
  joined_at!: Date;

  // Relationships
  user?: User;
  chain?: PrayerChain;

  static get tableName() {
    return 'chain_participants';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['chain_id', 'user_id', 'turn_order'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        chain_id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        turn_order: { type: 'integer', minimum: 0 },
        is_active: { type: 'boolean' },
        last_prayer_at: { type: ['string', 'null'], format: 'date-time' },
        joined_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'chain_participants.user_id',
          to: 'users.id'
        }
      },
      chain: {
        relation: Model.BelongsToOneRelation,
        modelClass: PrayerChain,
        join: {
          from: 'chain_participants.chain_id',
          to: 'prayer_chains.id'
        }
      }
    };
  }

  // Helper methods
  async updateLastPrayerTime(): Promise<void> {
    await this.$query().patch({
      last_prayer_at: new Date()
    });
  }

  async leave(): Promise<void> {
    await this.$query().patch({
      is_active: false
    });
  }
} 