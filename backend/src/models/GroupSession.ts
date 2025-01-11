import { Model } from 'objection';
import { User } from './User';
import { PrayerGroup } from './PrayerGroup';
import { SessionParticipant } from './SessionParticipant';

export class GroupSession extends Model {
  id!: string;
  group_id!: string;
  creator_id!: string;
  title!: string;
  description?: string;
  scheduled_time!: Date;
  duration_minutes!: number;
  status!: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  type!: 'video' | 'audio' | 'text';
  meeting_link?: string;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  creator?: User;
  group?: PrayerGroup;
  participants?: SessionParticipant[];

  static get tableName() {
    return 'group_sessions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['group_id', 'creator_id', 'title', 'scheduled_time', 'duration_minutes'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        group_id: { type: 'string', format: 'uuid' },
        creator_id: { type: 'string', format: 'uuid' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] },
        scheduled_time: { type: 'string', format: 'date-time' },
        duration_minutes: { type: 'integer', minimum: 1 },
        status: { type: 'string', enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] },
        type: { type: 'string', enum: ['video', 'audio', 'text'] },
        meeting_link: { type: ['string', 'null'] },
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
          from: 'group_sessions.creator_id',
          to: 'users.id'
        }
      },
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: PrayerGroup,
        join: {
          from: 'group_sessions.group_id',
          to: 'prayer_groups.id'
        }
      },
      participants: {
        relation: Model.HasManyRelation,
        modelClass: SessionParticipant,
        join: {
          from: 'group_sessions.id',
          to: 'session_participants.session_id'
        }
      }
    };
  }

  // Helper methods
  async start() {
    if (this.status !== 'scheduled') {
      throw new Error('Session can only be started when scheduled');
    }
    return await GroupSession.query()
      .patch({ status: 'in_progress' })
      .where('id', this.id);
  }

  async complete() {
    if (this.status !== 'in_progress') {
      throw new Error('Session can only be completed when in progress');
    }
    return await GroupSession.query()
      .patch({ status: 'completed' })
      .where('id', this.id);
  }

  async cancel() {
    if (!['scheduled', 'in_progress'].includes(this.status)) {
      throw new Error('Session can only be cancelled when scheduled or in progress');
    }
    return await GroupSession.query()
      .patch({ status: 'cancelled' })
      .where('id', this.id);
  }

  async addParticipant(userId: string) {
    return await SessionParticipant.query().insert({
      session_id: this.id,
      user_id: userId,
      status: 'registered'
    });
  }

  async removeParticipant(userId: string) {
    return await SessionParticipant.query()
      .where('session_id', this.id)
      .where('user_id', userId)
      .delete();
  }

  async getParticipantCount() {
    return await SessionParticipant.query()
      .where('session_id', this.id)
      .resultSize();
  }

  isUpcoming() {
    return new Date(this.scheduled_time) > new Date();
  }

  canJoin() {
    return this.status === 'scheduled' || this.status === 'in_progress';
  }
} 