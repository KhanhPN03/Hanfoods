const mongoose = require('mongoose');
const Cart = require('./hfbe/models/Cart');
const Product = require('./hfbe/models/Product');
const Account = require('./hfbe/models/Account');

async function testCartDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/hanfoods');
    console.log('✅ Connected to MongoDB');

    // Find all carts in database
    const carts = await Cart.find({}).populate({
      path: 'items.productId',
      select: 'name price salePrice stock thumbnailImage'
    });

    console.log(`📦 Found ${carts.length} carts in database`);

    carts.forEach((cart, index) => {
      console.log(`\n🛒 Cart ${index + 1}:`);
      console.log(`   Cart ID: ${cart.cartId}`);
      console.log(`   User ID: ${cart.userId}`);
      console.log(`   Items: ${cart.items.length}`);
      
      cart.items.forEach((item, itemIndex) => {
        console.log(`   📋 Item ${itemIndex + 1}:`);
        console.log(`       Product ID: ${item.productId?._id}`);
        console.log(`       Product Name: ${item.productId?.name || 'N/A'}`);
        console.log(`       Quantity: ${item.quantity}`);
        console.log(`       Price: ${item.productId?.price || 'N/A'}`);
        console.log(`       Sale Price: ${item.productId?.salePrice || 'N/A'}`);
      });
    });

    // Also check if there are any accounts
    const accountCount = await Account.countDocuments();
    console.log(`\n👤 Found ${accountCount} accounts in database`);

    // Check products
    const productCount = await Product.countDocuments();
    console.log(`📦 Found ${productCount} products in database`);

    await mongoose.disconnect();
    console.log('✅ Database test completed');

  } catch (error) {
    console.error('❌ Database test error:', error);
    await mongoose.disconnect();
  }
}

testCartDatabase();
