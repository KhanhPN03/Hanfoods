/**
 * Script to verify products in the database
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function verifyProducts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
      // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB successfully');
    
    // Get product count
    const count = await Product.countDocuments();
    console.log(`📊 Total products in database: ${count}`);
    
    // Get category count
    const categoryCount = await Category.countDocuments();
    console.log(`📊 Total categories in database: ${categoryCount}`);
    
    // List categories
    const categories = await Category.find();
    console.log('\n📋 Categories:');
    for (const category of categories) {
      const productCount = await Product.countDocuments({ categoryId: category._id });
      console.log(`- ${category.name} (${productCount} products)`);
    }
    
    // Get sample products
    const products = await Product.find().populate('categoryId').limit(3);
    console.log('\n📋 Sample products:');
    
    // Display product details
    for (const product of products) {
      console.log(`\n------ ${product.name} ------`);
      console.log(`ID: ${product._id}`);
      console.log(`ProductID: ${product.productId}`);
      console.log(`Category: ${product.categoryId?.name || 'N/A'}`);
      console.log(`Price: ${product.price} VND (Sale: ${product.salePrice || 'No Sale'} VND)`);
      console.log(`Thumbnail: ${product.thumbnailImage}`);
      console.log(`Images: ${product.images.length} images`);
      console.log(`Rating: ${product.rating} (${product.reviewCount} reviews)`);
      console.log(`Materials: ${product.materials}`);
      console.log(`Dimensions: ${product.dimensions}`);
    }
    
    console.log('\n✅ Verification completed');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error verifying products:', error);
  }
}

verifyProducts();
