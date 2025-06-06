const mongoose = require('mongoose');
const Account = require('./models/Account');

async function createTestUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/hanfoods');
    console.log('✅ Connected to MongoDB');

    // Check if test users already exist
    const existingCustomer = await Account.findOne({ email: 'test@customer.com' });
    const existingAdmin = await Account.findOne({ email: 'admin@test.com' });

    if (!existingCustomer) {
      console.log('🔄 Creating test customer...');
      const customer = new Account({
        email: 'test@customer.com',
        username: 'testcustomer',
        firstname: 'Test',
        lastname: 'Customer',
        role: 'customer',
        accountCode: 'CUST-TEST001'
      });
      
      await Account.register(customer, 'password123');
      console.log('✅ Test customer created: test@customer.com / password123');
    } else {
      console.log('ℹ️ Test customer already exists');
    }

    if (!existingAdmin) {
      console.log('🔄 Creating test admin...');
      const admin = new Account({
        email: 'admin@test.com',
        username: 'testadmin',
        firstname: 'Test',
        lastname: 'Admin',
        role: 'admin',
        accountCode: 'ADMIN-TEST001'
      });
      
      await Account.register(admin, 'admin123');
      console.log('✅ Test admin created: admin@test.com / admin123');
    } else {
      console.log('ℹ️ Test admin already exists');
    }

    console.log('\n🎉 Test users setup completed!');
    console.log('📋 Available test accounts:');
    console.log('   Customer: test@customer.com / password123');
    console.log('   Admin: admin@test.com / admin123');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestUsers();
