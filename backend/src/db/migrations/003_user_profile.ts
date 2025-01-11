import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('avatar').nullable();
    table.text('bio').nullable();
    table.jsonb('preferences').defaultTo(JSON.stringify({
      emailNotifications: true,
      prayerReminders: true,
      chainTurnNotifications: true,
      dailyDigest: false
    }));
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('avatar');
    table.dropColumn('bio');
    table.dropColumn('preferences');
  });
} 