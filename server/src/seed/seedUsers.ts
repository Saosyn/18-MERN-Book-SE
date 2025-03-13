// seedUsers.js
import User from '../models/User.js';

const seedUsers = async () => {
  try {
    const existingUsers = await User.find({});
    if (existingUsers.length === 0) {
      await User.create([
        {
          username: 'testuser1',
          email: 'test1@example.com',
          password: 'password123',
        },
        {
          username: 'testuser2',
          email: 'test2@example.com',
          password: 'password456',
        },
      ]);
      console.log('Users seeded successfully.');
    } else {
      console.log('Users already exist.');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

export default seedUsers;
