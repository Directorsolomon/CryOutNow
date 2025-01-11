import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Prayer Groups table
  await knex.schema.createTable('prayer_groups', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.text('description');
    table.uuid('creator_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('privacy', ['public', 'private', 'invite_only']).defaultTo('public');
    table.integer('max_members').defaultTo(50);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Group Members table
  await knex.schema.createTable('group_members', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable().references('id').inTable('prayer_groups').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('role', ['member', 'moderator', 'admin']).defaultTo('member');
    table.enum('status', ['pending', 'active', 'blocked']).defaultTo('pending');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.timestamps(true, true);
    // Unique constraint to prevent duplicate memberships
    table.unique(['group_id', 'user_id']);
  });

  // Group Sessions table
  await knex.schema.createTable('group_sessions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable().references('id').inTable('prayer_groups').onDelete('CASCADE');
    table.uuid('creator_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.timestamp('scheduled_time').notNullable();
    table.integer('duration_minutes').notNullable();
    table.enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled']).defaultTo('scheduled');
    table.enum('type', ['video', 'audio', 'text']).defaultTo('text');
    table.string('meeting_link');
    table.timestamps(true, true);
  });

  // Session Participants table
  await knex.schema.createTable('session_participants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('session_id').notNullable().references('id').inTable('group_sessions').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.enum('status', ['registered', 'attended', 'absent']).defaultTo('registered');
    table.timestamp('joined_at');
    table.timestamp('left_at');
    table.timestamps(true, true);
    // Unique constraint to prevent duplicate participation
    table.unique(['session_id', 'user_id']);
  });

  // Group Prayer Requests table
  await knex.schema.createTable('group_prayer_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('group_id').notNullable().references('id').inTable('prayer_groups').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.enum('status', ['active', 'answered', 'archived']).defaultTo('active');
    table.integer('prayer_count').defaultTo(0);
    table.timestamps(true, true);
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('group_prayer_requests');
  await knex.schema.dropTableIfExists('session_participants');
  await knex.schema.dropTableIfExists('group_sessions');
  await knex.schema.dropTableIfExists('group_members');
  await knex.schema.dropTableIfExists('prayer_groups');
}

