import { Model } from 'objection';
import { PrayerRequest } from './PrayerRequest';
import { ChainParticipant } from './ChainParticipant';
import { PrayerChain } from './PrayerChain';

interface UserPreferences {
  emailNotifications: boolean;
  prayerReminders: boolean;
  chainTurnNotifications: boolean;
  dailyDigest: boolean;
}

export class User extends Model {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  avatar?: string;
  bio?: string;
  preferences?: UserPreferences;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  prayers?: PrayerRequest[];
  chainParticipations?: ChainParticipant[];
  createdChains?: PrayerChain[];

  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 2 },
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 6 },
        avatar: { type: ['string', 'null'], format: 'uri' },
        bio: { type: ['string', 'null'], maxLength: 500 },
        preferences: {
          type: ['object', 'null'],
          properties: {
            emailNotifications: { type: 'boolean' },
            prayerReminders: { type: 'boolean' },
            chainTurnNotifications: { type: 'boolean' },
            dailyDigest: { type: 'boolean' }
          }
        },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      prayers: {
        relation: Model.HasManyRelation,
        modelClass: PrayerRequest,
        join: {
          from: 'users.id',
          to: 'prayer_requests.user_id'
        }
      },
      chainParticipations: {
        relation: Model.HasManyRelation,
        modelClass: ChainParticipant,
        join: {
          from: 'users.id',
          to: 'chain_participants.user_id'
        }
      },
      createdChains: {
        relation: Model.HasManyRelation,
        modelClass: PrayerChain,
        join: {
          from: 'users.id',
          to: 'prayer_chains.creator_id'
        }
      }
    };
  }

  // Helper methods
  async $beforeInsert() {
    this.created_at = new Date();
    this.updated_at = new Date();
    this.preferences = {
      emailNotifications: true,
      prayerReminders: true,
      chainTurnNotifications: true,
      dailyDigest: false
    };
  }

  async $beforeUpdate() {
    this.updated_at = new Date();
  }

  $formatJson(json: any) {
    json = super.$formatJson(json);
    delete json.password;
    return json;
  }
} 