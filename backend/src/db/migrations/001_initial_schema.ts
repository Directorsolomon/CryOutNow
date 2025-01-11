import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('display_name').notNullable();
    table.string('photo_url');
    table.timestamps(true, true);
  });

  // Prayer requests table
  await knex.schema.createTable('prayer_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.specificType('tags', 'text[]');
    table.enum('status', ['active', 'answered']).defaultTo('active');
    table.text('answer_note');
    table.timestamp('answered_at');
    table.integer('prayer_count').defaultTo(0);
    table.timestamps(true, true);
  });

  // Prayer commitments table
  await knex.schema.createTable('prayer_commitments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('prayer_request_id').references('id').inTable('prayer_requests').onDelete('CASCADE');
    table.timestamps(true, true);
    table.unique(['user_id', 'prayer_request_id']);
  });

  // Comments table
  await knex.schema.createTable('comments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('prayer_request_id').references('id').inTable('prayer_requests').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('comments');
  await knex.schema.dropTableIfExists('prayer_commitments');
  await knex.schema.dropTableIfExists('prayer_requests');
  await knex.schema.dropTableIfExists('users');
} 