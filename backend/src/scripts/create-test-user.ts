import bcrypt from 'bcrypt';
import { db } from '../db/connection';

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('Password123!', 10);
    
    const [user] = await db('users')
      .insert({
        email: 'test@example.com',
        password_hash: hashedPassword,
        display_name: 'Test User',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    console.log('Test user created successfully:', {
      email: user.email,
      displayName: user.display_name,
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

createTestUser(); 