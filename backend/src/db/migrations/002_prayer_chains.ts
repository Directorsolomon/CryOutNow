import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create prayer_chains table
  await knex.schema.createTable('prayer_chains', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('title').notNullable();
    table.text('description');
    table.uuid('creator_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('max_participants').defaultTo(10);
    table.integer('turn_duration_days').defaultTo(1);
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create chain_participants table
  await knex.schema.createTable('chain_participants', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('chain_id').references('id').inTable('prayer_chains').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('turn_order').notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_prayer_at');
    table.timestamp('joined_at').defaultTo(knex.fn.now());
    table.unique(['chain_id', 'user_id']);
    table.unique(['chain_id', 'turn_order']);
  });

  // Create chain_prayers table
  await knex.schema.createTable('chain_prayers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('chain_id').references('id').inTable('prayer_chains').onDelete('CASCADE');
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('prayer_text').notNullable();
    table.timestamp('prayed_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('chain_prayers');
  await knex.schema.dropTableIfExists('chain_participants');
  await knex.schema.dropTableIfExists('prayer_chains');
} 