import { Model } from 'objection';
import { User } from './User';
import { PrayerGroup } from './PrayerGroup';

export class GroupPrayerRequest extends Model {
  id!: string;
  group_id!: string;
  user_id!: string;
  title!: string;
  content!: string;
  status!: 'active' | 'answered' | 'archived';
  prayer_count!: number;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  user?: User;
  group?: PrayerGroup;

  static get tableName() {
    return 'group_prayer_requests';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['group_id', 'user_id', 'title', 'content'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        group_id: { type: 'string', format: 'uuid' },
        user_id: { type: 'string', format: 'uuid' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        content: { type: 'string', minLength: 1 },
        status: { type: 'string', enum: ['active', 'answered', 'archived'] },
        prayer_count: { type: 'integer', minimum: 0 },
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
          from: 'group_prayer_requests.user_id',
          to: 'users.id'
        }
      },
      group: {
        relation: Model.BelongsToOneRelation,
        modelClass: PrayerGroup,
        join: {
          from: 'group_prayer_requests.group_id',
          to: 'prayer_groups.id'
        }
      }
    };
  }

  // Helper methods
  async markAsAnswered() {
    return await GroupPrayerRequest.query()
      .patch({ status: 'answered' })
      .where('id', this.id);
  }

  async archive() {
    return await GroupPrayerRequest.query()
      .patch({ status: 'archived' })
      .where('id', this.id);
  }

  async incrementPrayerCount() {
    return await GroupPrayerRequest.query()
      .increment('prayer_count', 1)
      .where('id', this.id);
  }

  isActive() {
    return this.status === 'active';
  }

  isAnswered() {
    return this.status === 'answered';
  }

  isArchived() {
    return this.status === 'archived';
  }
} 