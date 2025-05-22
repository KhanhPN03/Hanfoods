const mongoose = require('mongoose');
const Account = require('./models/Account');

async function checkDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:5000/hanfoods');
    console.log('Connected to MongoDB');
    
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

checkDatabase();
