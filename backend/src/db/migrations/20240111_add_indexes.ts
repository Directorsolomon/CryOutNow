import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table indexes
  await knex.schema.alterTable('users', table => {
    table.index('email');
    table.index('display_name');
    table.index('created_at');
  });

  // Prayer chains indexes
  await knex.schema.alterTable('prayer_chains', table => {
    table.index('creator_id');
    table.index('status');
    table.index('created_at');
    table.index(['creator_id', 'status']);
  });

  // Prayer chain participants indexes
  await knex.schema.alterTable('chain_participants', table => {
    table.index('chain_id');
    table.index('user_id');
    table.index('status');
    table.index(['chain_id', 'status']);
    table.index(['user_id', 'status']);
  });

  // Prayer groups indexes
  await knex.schema.alterTable('prayer_groups', table => {
    table.index('creator_id');
    table.index('privacy');
    table.index('is_active');
    table.index('created_at');
    table.index(['privacy', 'is_active']);
  });

  // Group members indexes
  await knex.schema.alterTable('group_members', table => {
    table.index('group_id');
    table.index('user_id');
    table.index('role');
    table.index('status');
    table.index(['group_id', 'role']);
    table.index(['user_id', 'status']);
  });

  // Group sessions indexes
  await knex.schema.alterTable('group_sessions', table => {
    table.index('group_id');
    table.index('creator_id');
    table.index('scheduled_time');
    table.index('status');
    table.index(['group_id', 'status']);
    table.index(['scheduled_time', 'status']);
  });

  // Session participants indexes
  await knex.schema.alterTable('session_participants', table => {
    table.index('session_id');
    table.index('user_id');
    table.index('status');
    table.index(['session_id', 'status']);
  });

  // Group prayer requests indexes
  await knex.schema.alterTable('group_prayer_requests', table => {
    table.index('group_id');
    table.index('user_id');
    table.index('status');
    table.index('created_at');
    table.index(['group_id', 'status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove indexes from users table
  await knex.schema.alterTable('users', table => {
    table.dropIndex(['email']);
    table.dropIndex(['display_name']);
    table.dropIndex(['created_at']);
  });

  // Remove indexes from prayer chains table
  await knex.schema.alterTable('prayer_chains', table => {
    table.dropIndex(['creator_id']);
    table.dropIndex(['status']);
    table.dropIndex(['created_at']);
    table.dropIndex(['creator_id', 'status']);
  });

  // Remove indexes from chain participants table
  await knex.schema.alterTable('chain_participants', table => {
    table.dropIndex(['chain_id']);
    table.dropIndex(['user_id']);
    table.dropIndex(['status']);
    table.dropIndex(['chain_id', 'status']);
    table.dropIndex(['user_id', 'status']);
  });

  // Remove indexes from prayer groups table
  await knex.schema.alterTable('prayer_groups', table => {
    table.dropIndex(['creator_id']);
    table.dropIndex(['privacy']);
    table.dropIndex(['is_active']);
    table.dropIndex(['created_at']);
    table.dropIndex(['privacy', 'is_active']);
  });

  // Remove indexes from group members table
  await knex.schema.alterTable('group_members', table => {
    table.dropIndex(['group_id']);
    table.dropIndex(['user_id']);
    table.dropIndex(['role']);
    table.dropIndex(['status']);
    table.dropIndex(['group_id', 'role']);
    table.dropIndex(['user_id', 'status']);
  });

  // Remove indexes from group sessions table
  await knex.schema.alterTable('group_sessions', table => {
    table.dropIndex(['group_id']);
    table.dropIndex(['creator_id']);
    table.dropIndex(['scheduled_time']);
    table.dropIndex(['status']);
    table.dropIndex(['group_id', 'status']);
    table.dropIndex(['scheduled_time', 'status']);
  });

  // Remove indexes from session participants table
  await knex.schema.alterTable('session_participants', table => {
    table.dropIndex(['session_id']);
    table.dropIndex(['user_id']);
    table.dropIndex(['status']);
    table.dropIndex(['session_id', 'status']);
  });

  // Remove indexes from group prayer requests table
  await knex.schema.alterTable('group_prayer_requests', table => {
    table.dropIndex(['group_id']);
    table.dropIndex(['user_id']);
    table.dropIndex(['status']);
    table.dropIndex(['created_at']);
    table.dropIndex(['group_id', 'status']);
  });
} 