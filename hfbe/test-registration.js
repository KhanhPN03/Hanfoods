const mongoose = require('mongoose');
const Account = require('./models/Account');
const AuthService = require('./services/AuthService');

async function testRegistration() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/hanfoods');
    console.log('Connected to MongoDB');
    
    // Create a test user
    const testUser = {
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'password123',
      firstname: 'Test',
      lastname: 'User',
      DOB: new Date(1990, 0, 1),
      gender: 'male',
      phone: '1234567890'
    };
    
    // Try to register the user
    try {
      const newUser = await AuthService.registerUser(testUser);
      console.log('User registered successfully:', newUser);
    } catch (error) {
      console.error('Registration error:', error.message);
    }
    
    // Check all users in the database
    const users = await Account.find({});
    console.log('Users in database:');
    console.log(JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testRegistration();
