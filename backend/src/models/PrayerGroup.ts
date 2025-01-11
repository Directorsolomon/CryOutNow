import { Model } from 'objection';
import { User } from './User';
import { GroupMember } from './GroupMember';
import { GroupSession } from './GroupSession';
import { GroupPrayerRequest } from './GroupPrayerRequest';

export class PrayerGroup extends Model {
  id!: string;
  name!: string;
  description?: string;
  creator_id!: string;
  privacy!: 'public' | 'private' | 'invite_only';
  max_members!: number;
  is_active!: boolean;
  created_at!: Date;
  updated_at!: Date;

  // Relationships
  creator?: User;
  members?: GroupMember[];
  sessions?: GroupSession[];
  prayerRequests?: GroupPrayerRequest[];

  static get tableName() {
    return 'prayer_groups';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'creator_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] },
        creator_id: { type: 'string', format: 'uuid' },
        privacy: { type: 'string', enum: ['public', 'private', 'invite_only'] },
        max_members: { type: 'integer', minimum: 1 },
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
          from: 'prayer_groups.creator_id',
          to: 'users.id'
        }
      },
      members: {
        relation: Model.HasManyRelation,
        modelClass: GroupMember,
        join: {
          from: 'prayer_groups.id',
          to: 'group_members.group_id'
        }
      },
      sessions: {
        relation: Model.HasManyRelation,
        modelClass: GroupSession,
        join: {
          from: 'prayer_groups.id',
          to: 'group_sessions.group_id'
        }
      },
      prayerRequests: {
        relation: Model.HasManyRelation,
        modelClass: GroupPrayerRequest,
        join: {
          from: 'prayer_groups.id',
          to: 'group_prayer_requests.group_id'
        }
      }
    };
  }

  // Helper methods
  async addMember(userId: string, role: 'member' | 'moderator' | 'admin' = 'member') {
    const currentMemberCount = await GroupMember.query()
      .where('group_id', this.id)
      .where('status', 'active')
      .resultSize();

    if (currentMemberCount >= this.max_members) {
      throw new Error('Group has reached maximum member limit');
    }

    return await GroupMember.query().insert({
      group_id: this.id,
      user_id: userId,
      role,
      status: 'active'
    });
  }

  async removeMember(userId: string) {
    return await GroupMember.query()
      .where('group_id', this.id)
      .where('user_id', userId)
      .delete();
  }

  async isMember(userId: string) {
    const member = await GroupMember.query()
      .where('group_id', this.id)
      .where('user_id', userId)
      .where('status', 'active')
      .first();
    return !!member;
  }

  async getMemberRole(userId: string) {
    const member = await GroupMember.query()
      .where('group_id', this.id)
      .where('user_id', userId)
      .where('status', 'active')
      .first();
    return member?.role;
  }
} 