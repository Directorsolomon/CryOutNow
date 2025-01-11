import { db } from '../db/connection';

beforeAll(async () => {
  // Any additional setup before tests
});

afterAll(async () => {
  // Any additional cleanup after tests
});

beforeEach(async () => {
  // Clear all tables before each test
  const connection = await db.getConnection();
  await connection('users').del();
  await connection('prayer_chains').del();
  await connection('prayer_chain_members').del();
  await connection('prayers').del();
});

afterEach(async () => {
  // Any cleanup after each test
}); 