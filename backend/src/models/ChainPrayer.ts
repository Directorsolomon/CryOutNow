import { Model } from 'objection';
import { User } from './User';
import { PrayerChain } from './PrayerChain';

export class ChainPrayer extends Model {
  id!: string;
  chain_id!: string;
  user_id!: string;
  prayer_text!: string;
  prayed_at!: Date;

  // Relationships
  user?: User;
  chain?: PrayerChain;

  static get tableName() {
    return 'chain_prayers';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['chain_id', 'user_id', 'prayer_text'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        chain_id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        prayer_text: { type: 'string', minLength: 1 },
        prayed_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'chain_prayers.user_id',
          to: 'users.id'
        }
      },
      chain: {
        relation: Model.BelongsToOneRelation,
        modelClass: PrayerChain,
        join: {
          from: 'chain_prayers.chain_id',
          to: 'prayer_chains.id'
        }
      }
    };
  }

  // Helper methods
  static async getChainHistory(chainId: string): Promise<ChainPrayer[]> {
    return await ChainPrayer.query()
      .where('chain_id', chainId)
      .orderBy('prayed_at', 'desc')
      .withGraphFetched('user');
  }
} 