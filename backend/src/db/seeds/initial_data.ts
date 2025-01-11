import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // Clean the tables
  await knex('chain_prayers').del();
  await knex('chain_participants').del();
  await knex('prayer_chains').del();
  await knex('users').del();

  // Create password hash
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert users
  const [user1, user2, user3] = await knex('users').insert([
    {
      display_name: 'John Doe',
      email: 'john@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      display_name: 'Jane Smith',
      email: 'jane@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      display_name: 'Bob Wilson',
      email: 'bob@example.com',
      password_hash: passwordHash,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]).returning('*');

  // Insert prayer chains
  const [chain1, chain2] = await knex('prayer_chains').insert([
    {
      title: 'Morning Prayer Chain',
      description: 'Join us in daily morning prayers for peace and guidance.',
      creator_id: user1.id,
      max_participants: 5,
      turn_duration_days: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      title: 'Healing Prayer Chain',
      description: 'A prayer chain dedicated to praying for healing and recovery.',
      creator_id: user2.id,
      max_participants: 3,
      turn_duration_days: 2,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]).returning('*');

  // Insert chain participants
  await knex('chain_participants').insert([
    {
      chain_id: chain1.id,
      user_id: user1.id,
      turn_order: 0,
      is_active: true,
      joined_at: new Date(),
    },
    {
      chain_id: chain1.id,
      user_id: user2.id,
      turn_order: 1,
      is_active: true,
      joined_at: new Date(),
    },
    {
      chain_id: chain2.id,
      user_id: user2.id,
      turn_order: 0,
      is_active: true,
      joined_at: new Date(),
    },
    {
      chain_id: chain2.id,
      user_id: user3.id,
      turn_order: 1,
      is_active: true,
      joined_at: new Date(),
    },
  ]);

  // Insert some prayers
  await knex('chain_prayers').insert([
    {
      chain_id: chain1.id,
      user_id: user1.id,
      prayer_text: 'Praying for peace and unity in our community.',
      prayed_at: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      chain_id: chain1.id,
      user_id: user2.id,
      prayer_text: 'Grateful for another day and asking for guidance.',
      prayed_at: new Date(),
    },
    {
      chain_id: chain2.id,
      user_id: user2.id,
      prayer_text: 'Praying for healing for all those who are sick.',
      prayed_at: new Date(Date.now() - 172800000), // 2 days ago
    },
  ]);
} 