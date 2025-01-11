import { Model } from 'objection';
import { User } from './User';
import { PrayerGroup } from './PrayerGroup';

export class GroupMember extends Model {
  id!: string;
  group_id!: string;
  user_id!: string;
  role!: 'member' | 'moderator' | 'admin';
  status!: 'pending' | 'active' | 'blocked';
  joined_at!: Date;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  user?: User;
  group?: PrayerGroup;

  static get tableName() {
    return 'group_members';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['group_id', 'user_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        group_id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        role: { type: 'string', enum: ['member', 'moderator', 'admin'] },
        status: { type: 'string', enum: ['pending', 'active', 'blocked'] },
        joined_at: { type: 'string', format: 'date-time' },
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
          from: 'group_members.user_id',
          to: 'users.id'
        }
      },
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: PrayerGroup,
        join: {
          from: 'group_members.group_id',
          to: 'prayer_groups.id'
        }
      }
    };
  }

  // Helper methods
  async activate() {
    return await GroupMember.query()
      .patch({ status: 'active' })
      .where('id', this.id);
  }

  async block() {
    return await GroupMember.query()
      .patch({ status: 'blocked' })
      .where('id', this.id);
  }

  async updateRole(newRole: 'member' | 'moderator' | 'admin') {
    return await GroupMember.query()
      .patch({ role: newRole })
      .where('id', this.id);
  }

  isAdmin() {
    return this.role === 'admin';
  }

  isModerator() {
    return this.role === 'moderator' || this.role === 'admin';
  }

  isActive() {
    return this.status === 'active';
  }
} 