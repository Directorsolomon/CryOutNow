import { Model } from 'objection';
import { User } from './User';
import { GroupSession } from './GroupSession';

export class SessionParticipant extends Model {
  id!: string;
  session_id!: string;
  user_id!: string;
  status!: 'registered' | 'attended' | 'absent';
  joined_at?: Date;
  left_at?: Date;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  user?: User;
  session?: GroupSession;

  static get tableName() {
    return 'session_participants';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['session_id', 'user_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        session_id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        status: { type: 'string', enum: ['registered', 'attended', 'absent'] },
        joined_at: { type: ['string', 'null'], format: 'date-time' },
        left_at: { type: ['string', 'null'], format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'session_participants.user_id',
          to: 'users.id'
        }
      },
      session: {
        relation: Model.BelongsToOneRelation,
        modelClass: GroupSession,
        join: {
          from: 'session_participants.session_id',
          to: 'group_sessions.id'
        }
      }
    };
  }

  // Helper methods
  async markAttended() {
    return await SessionParticipant.query()
      .patch({
        status: 'attended',
        joined_at: new Date().toISOString()
      })
      .where('id', this.id);
  }

  async markAbsent() {
    return await SessionParticipant.query()
      .patch({
        status: 'absent'
      })
      .where('id', this.id);
  }

  async recordLeave() {
    return await SessionParticipant.query()
      .patch({
        left_at: new Date().toISOString()
      })
      .where('id', this.id);
  }

  getDuration() {
    if (!this.joined_at || !this.left_at) {
      return 0;
    }
    return new Date(this.left_at).getTime() - new Date(this.joined_at).getTime();
  }

  isPresent() {
    return this.status === 'attended' && this.joined_at && !this.left_at;
  }
} 