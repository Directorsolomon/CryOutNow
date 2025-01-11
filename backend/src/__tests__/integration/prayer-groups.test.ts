import request from 'supertest';
import { app } from '../../app';
import { knex } from '../../db/knex';
import { generateToken } from '../../utils/auth';
import { PrayerGroup } from '../../models/PrayerGroup';
import { User } from '../../models/User';

describe('Prayer Groups API', () => {
  let testUser: User;
  let authToken: string;

  beforeAll(async () => {
    // Create test user
    testUser = await User.query().insert({
      email: 'test@example.com',
      password: 'hashedPassword',
      displayName: 'Test User',
    });

    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  beforeEach(async () => {
    // Clear relevant tables before each test
    await PrayerGroup.query().delete();
  });

  describe('POST /api/groups', () => {
    it('creates a new prayer group', async () => {
      const groupData = {
        name: 'Test Group',
        description: 'Test Description',
        privacy: 'public',
        maxMembers: 10,
      };

      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send(groupData);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        name: groupData.name,
        description: groupData.description,
        privacy: groupData.privacy,
        maxMembers: groupData.maxMembers,
        creator_id: testUser.id,
      });
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/groups', () => {
    beforeEach(async () => {
      // Create test groups
      await PrayerGroup.query().insert([
        {
          name: 'Public Group',
          privacy: 'public',
          creator_id: testUser.id,
        },
        {
          name: 'Private Group',
          privacy: 'private',
          creator_id: testUser.id,
        },
      ]);
    });

    it('returns public groups', async () => {
      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2); // User can see both as creator
      expect(response.body[0]).toHaveProperty('name', 'Public Group');
    });

    it('filters by privacy', async () => {
      const response = await request(app)
        .get('/api/groups?privacy=public')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].privacy).toBe('public');
    });
  });

  describe('GET /api/groups/:id', () => {
    let testGroup: PrayerGroup;

    beforeEach(async () => {
      testGroup = await PrayerGroup.query().insert({
        name: 'Test Group',
        privacy: 'public',
        creator_id: testUser.id,
      });
    });

    it('returns group details', async () => {
      const response = await request(app)
        .get(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: testGroup.id,
        name: testGroup.name,
        privacy: testGroup.privacy,
      });
    });

    it('returns 404 for non-existent group', async () => {
      const response = await request(app)
        .get('/api/groups/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/groups/:id', () => {
    let testGroup: PrayerGroup;

    beforeEach(async () => {
      testGroup = await PrayerGroup.query().insert({
        name: 'Test Group',
        privacy: 'public',
        creator_id: testUser.id,
      });
    });

    it('updates group details', async () => {
      const updateData = {
        name: 'Updated Group',
        description: 'Updated Description',
      };

      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updateData);
    });

    it('prevents non-creator from updating', async () => {
      const otherUser = await User.query().insert({
        email: 'other@example.com',
        password: 'hashedPassword',
        displayName: 'Other User',
      });

      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Hacked Group' });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/groups/:id/members', () => {
    let testGroup: PrayerGroup;

    beforeEach(async () => {
      testGroup = await PrayerGroup.query().insert({
        name: 'Test Group',
        privacy: 'public',
        creator_id: testUser.id,
      });
    });

    it('allows joining public group', async () => {
      const otherUser = await User.query().insert({
        email: 'joiner@example.com',
        password: 'hashedPassword',
        displayName: 'Joiner',
      });

      const joinerToken = generateToken(otherUser);

      const response = await request(app)
        .post(`/api/groups/${testGroup.id}/members`)
        .set('Authorization', `Bearer ${joinerToken}`);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        group_id: testGroup.id,
        user_id: otherUser.id,
      });
    });

    it('prevents joining when group is full', async () => {
      const fullGroup = await PrayerGroup.query().insert({
        name: 'Full Group',
        privacy: 'public',
        creator_id: testUser.id,
        maxMembers: 1, // Only creator
      });

      const otherUser = await User.query().insert({
        email: 'joiner@example.com',
        password: 'hashedPassword',
        displayName: 'Joiner',
      });

      const joinerToken = generateToken(otherUser);

      const response = await request(app)
        .post(`/api/groups/${fullGroup.id}/members`)
        .set('Authorization', `Bearer ${joinerToken}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('full');
    });
  });
}); 