/**
 * Comprehensive CocoNature E-commerce Test Runner
 * 
 * This script performs the following tasks:
 * 1. Connects to the MongoDB database and checks connection
 * 2. Clears existing data in the test database
 * 3. Runs the test scenario script to populate database with relational data
 * 4. Validates all database relationships between entities
 * 5. Validates API routes and controller methods
 * 6. Generates a summary report of the test results
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Import all models
const Account = require('../models/Account');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Billing = require('../models/Billing');
const Discount = require('../models/Discount');
const Review = require('../models/Review');
const PaymentMethod = require('../models/PaymentMethod');

// Store test results
const testResults = {
  dbConnection: false,
  dataPopulation: false,
  relationshipValidation: false,
  routeValidation: false,
  errors: []
};

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('1. TESTING MONGODB CONNECTION:');
    console.log('Connecting to MongoDB database: hanfoods...');
    
    await mongoose.connect('mongodb://127.0.0.1:27017/hanfoods', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Successfully connected to MongoDB database');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in the database:`);
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    testResults.dbConnection = true;
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    testResults.errors.push('MongoDB connection failed: ' + error.message);
    return false;
  }
}

// Clear all collections
async function clearDatabase() {
  console.log('\n2. CLEARING DATABASE:');
  console.log('Deleting all records from collections...');
  
  try {
    await Account.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Address.deleteMany({});
    await PaymentMethod.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Billing.deleteMany({});
    await Discount.deleteMany({});
    await Review.deleteMany({});
    
    console.log('✅ All collections cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear database:', error.message);
    testResults.errors.push('Database clearing failed: ' + error.message);
    return false;
  }
}

// Create test data with relationships
async function populateTestData() {
  console.log('\n3. POPULATING TEST DATA:');
  console.log('Creating test data with complete relationships...');
  
  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminUser = new Account({
      email: 'admin@coconature.com',
      username: 'admin',
      accountCode: 'ADMIN-TEST',
      role: 'admin',
      firstname: 'Admin',
      lastname: 'User',
      DOB: new Date('1990-01-01'),
      gender: 'male',
      phone: '0901234567'
    });
    
    await Account.register(adminUser, 'Admin@123');
    
    // Create customer user
    console.log('Creating customer user...');
    const customer = new Account({
      email: 'customer@example.com',
      username: 'customer',
      accountCode: 'CUST-TEST',
      role: 'customer',
      firstname: 'Test',
      lastname: 'Customer',
      DOB: new Date('1995-05-15'),
      gender: 'female',
      phone: '0912345678'
    });
    
    await Account.register(customer, 'Customer@123');
    
    console.log('✅ Created users (1 admin, 1 customer)');
    
    // Create categories
    console.log('Creating product categories...');
    const categories = await Category.create([
      { 
        categoryId: 'CAT-FUNC',
        name: 'Thực phẩm chức năng',
        description: 'Các sản phẩm thực phẩm chức năng cho sức khỏe',
        createdBy: adminUser._id
      },
      { 
        categoryId: 'CAT-TEA',
        name: 'Trà thảo mộc', 
        description: 'Các loại trà thảo mộc tự nhiên',
        createdBy: adminUser._id
      }
    ]);
    
    console.log(`✅ Created ${categories.length} product categories`);
    
    // Create products
    console.log('Creating products...');
    const products = await Product.create([
      {
        productId: 'PRD-TEA-01',
        name: 'Trà Sen Tây Hồ',
        description: 'Trà sen Tây Hồ thơm ngon, giúp thanh lọc cơ thể',
        price: 120000,
        salePrice: 110000,
        stock: 100,
        categoryId: categories[1]._id,
        imageUrl: 'https://example.com/images/lotus-tea.jpg',
        createdBy: adminUser._id
      },
      {
        productId: 'PRD-FUNC-01',
        name: 'Viên nghệ mật ong',
        description: 'Viên nghệ mật ong hỗ trợ sức khỏe đường tiêu hóa',
        price: 250000,
        salePrice: 225000,
        stock: 75,
        categoryId: categories[0]._id,
        imageUrl: 'https://example.com/images/turmeric-honey.jpg',
        createdBy: adminUser._id
      }
    ]);
    
    console.log(`✅ Created ${products.length} products`);
    
    // Create address for customer
    console.log('Creating customer address...');
    const address = await Address.create({
      addressId: 'ADDR-TEST-01',
      userId: customer._id,
      street: '144 Xuân Thủy',
      city: 'Hà Nội',
      state: 'Cầu Giấy',
      country: 'Việt Nam',
      postalCode: '100000',
      isDefault: true,
      createdBy: customer._id
    });
    
    console.log('✅ Created customer address');
    
    // Create cart for customer
    console.log('Creating customer cart...');
    const cart = await Cart.create({
      cartId: 'CART-TEST-01',
      userId: customer._id,
      items: [
        {
          productId: products[0]._id,
          quantity: 2
        },
        {
          productId: products[1]._id,
          quantity: 1
        }
      ],
      createdBy: customer._id
    });
    
    console.log('✅ Created customer cart with 2 items');
    
    // Create wishlist for customer
    console.log('Creating customer wishlist...');
    const wishlist = await Wishlist.create({
      wishlistId: 'WISH-TEST-01',
      userId: customer._id,
      productId: products[0]._id,
      createdBy: customer._id
    });
    
    console.log('✅ Created customer wishlist');
    
    // Create payment method
    console.log('Creating payment methods...');
    const paymentMethod = await PaymentMethod.create({
      paymentMethodId: 'PAY-CASH',
      name: 'Cash on Delivery',
      description: 'Pay with cash when your order is delivered',
      createdBy: adminUser._id
    });
    
    console.log('✅ Created payment method');
    
    // Create discount
    console.log('Creating discount code...');
    const discount = await Discount.create({
      discountId: 'DISC-TEST',
      code: 'TEST20',
      description: '20% off for testing',
      discountType: 'percentage',
      discountValue: 20,
      minOrderValue: 100000,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      createdBy: adminUser._id
    });
    
    console.log('✅ Created discount code');
    
    // Create order
    console.log('Creating customer order...');
    const order = await Order.create({
      orderId: 'ORD-TEST-01',
      userId: customer._id,
      totalAmount: 365000,
      status: 'pending',
      addressId: address._id,
      items: [
        {
          productId: products[0]._id,
          name: products[0].name,
          price: products[0].price,
          quantity: 1,
          subtotal: products[0].price
        },
        {
          productId: products[1]._id,
          name: products[1].name,
          price: products[1].price,
          quantity: 1,
          subtotal: products[1].price
        }
      ],
      discountId: discount._id,
      discountAmount: 74000, // 20% of subtotal
      createdBy: customer._id
    });
    
    console.log('✅ Created customer order');
    
    // Create order items
    console.log('Creating order items...');
    for (const item of order.items) {
      await OrderItem.create({
        orderItemId: `ITEM-${item.productId}`,
        orderId: order._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        createdBy: customer._id
      });
    }
    
    console.log('✅ Created order items');
    
    // Create billing record
    console.log('Creating billing record...');
    const billing = await Billing.create({
      billingId: 'BILL-TEST-01',
      orderId: order._id,
      paymentMethodId: paymentMethod._id,
      amount: order.totalAmount,
      status: 'pending',
      createdBy: customer._id
    });
    
    console.log('✅ Created billing record');
    
    // Create review
    console.log('Creating product review...');
    const review = await Review.create({
      reviewId: 'REV-TEST-01',
      productId: products[0]._id,
      userId: customer._id,
      rating: 5,
      comment: 'Great product, highly recommended!',
      createdBy: customer._id
    });
    
    console.log('✅ Created product review');
    
    testResults.dataPopulation = true;
    console.log('\n✅ All test data created successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to populate test data:', error.message);
    testResults.errors.push('Test data population failed: ' + error.message);
    return false;
  }
}

// Validate database relationships
async function validateRelationships() {
  console.log('\n4. VALIDATING DATABASE RELATIONSHIPS:');
  
  try {
    // Check user-cart relationship
    console.log('Checking user-cart relationship...');
    const customer = await Account.findOne({ role: 'customer' });
    const cart = await Cart.findOne({ userId: customer._id });
    
    if (!cart) {
      throw new Error('Customer does not have a cart');
    }
    
    console.log('✅ User-cart relationship is valid');
    
    // Check cart-product relationships
    console.log('Checking cart-product relationships...');
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Invalid product reference in cart: ${item.productId}`);
      }
    }
    
    console.log('✅ Cart-product relationships are valid');
    
    // Check user-wishlist relationship
    console.log('Checking user-wishlist relationship...');
    const wishlist = await Wishlist.findOne({ userId: customer._id });
    
    if (!wishlist) {
      throw new Error('Customer does not have a wishlist');
    }
    
    const wishlistProduct = await Product.findById(wishlist.productId);
    if (!wishlistProduct) {
      throw new Error('Invalid product reference in wishlist');
    }
    
    console.log('✅ User-wishlist relationship is valid');
    
    // Check user-address relationship
    console.log('Checking user-address relationship...');
    const address = await Address.findOne({ userId: customer._id });
    
    if (!address) {
      throw new Error('Customer does not have an address');
    }
    
    console.log('✅ User-address relationship is valid');
    
    // Check user-order relationship
    console.log('Checking user-order relationship...');
    const order = await Order.findOne({ userId: customer._id });
    
    if (!order) {
      throw new Error('Customer does not have an order');
    }
    
    console.log('✅ User-order relationship is valid');
    
    // Check order-address relationship
    console.log('Checking order-address relationship...');
    const orderAddress = await Address.findById(order.addressId);
    
    if (!orderAddress) {
      throw new Error('Order has invalid address reference');
    }
    
    console.log('✅ Order-address relationship is valid');
    
    // Check order-product relationships
    console.log('Checking order-product relationships...');
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Invalid product reference in order: ${item.productId}`);
      }
    }
    
    console.log('✅ Order-product relationships are valid');
    
    // Check order-billing relationship
    console.log('Checking order-billing relationship...');
    const billing = await Billing.findOne({ orderId: order._id });
    
    if (!billing) {
      throw new Error('Order does not have a billing record');
    }
    
    console.log('✅ Order-billing relationship is valid');
    
    // Check product-category relationships
    console.log('Checking product-category relationships...');
    const products = await Product.find();
    
    for (const product of products) {
      const category = await Category.findById(product.categoryId);
      if (!category) {
        throw new Error(`Product ${product.name} has invalid category reference`);
      }
    }
    
    console.log('✅ Product-category relationships are valid');
    
    // Check product-review relationship
    console.log('Checking product-review relationship...');
    const review = await Review.findOne();
    
    if (review) {
      const reviewedProduct = await Product.findById(review.productId);
      const reviewer = await Account.findById(review.userId);
      
      if (!reviewedProduct) {
        throw new Error('Review has invalid product reference');
      }
      
      if (!reviewer) {
        throw new Error('Review has invalid user reference');
      }
      
      console.log('✅ Product-review relationship is valid');
    } else {
      console.log('⚠️ No reviews found to validate');
    }
    
    testResults.relationshipValidation = true;
    console.log('\n✅ All database relationships are valid');
    
    return true;
  } catch (error) {
    console.error('❌ Relationship validation failed:', error.message);
    testResults.errors.push('Relationship validation failed: ' + error.message);
    return false;
  }
}

// Validate routes and controllers
async function validateRoutes() {
  console.log('\n5. VALIDATING ROUTES AND CONTROLLERS:');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Get all route files
    const routesDir = path.join(__dirname, '..', 'routes');
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('Routes.js'));
    
    console.log(`Found ${routeFiles.length} route files`);
    
    // Required route endpoints for each feature
    const requiredRoutes = {
      'authRoutes.js': ['register', 'login', 'logout', 'profile'],
      'productRoutes.js': ['getProducts', 'getProductById', 'getProductsByCategory'],
      'cartRoutes.js': ['getCart', 'addToCart', 'updateCart', 'removeFromCart'],
      'wishlistRoutes.js': ['getWishlist', 'addToWishlist', 'removeFromWishlist'],
      'orderRoutes.js': ['getOrders', 'getOrderById', 'createOrder'],
      'addressRoutes.js': ['getAddresses', 'addAddress', 'updateAddress', 'deleteAddress']
    };
    
    let allRoutesValid = true;
    
    // Check each route file
    for (const routeFile of routeFiles) {
      console.log(`\nChecking ${routeFile}...`);
      
      const routePath = path.join(routesDir, routeFile);
      const routeContent = fs.readFileSync(routePath, 'utf8');
      
      // Extract controller name from import
      const controllerMatch = routeContent.match(/const\s+(\w+Controller)\s+=\s+require\(['"](.*)['"]\)/);
      
      if (!controllerMatch) {
        console.log(`❌ Could not find controller import in ${routeFile}`);
        allRoutesValid = false;
        continue;
      }
      
      const controllerName = controllerMatch[1];
      let controllerPath = controllerMatch[2];
      
      // Find controller file
      if (controllerPath.startsWith('./')) {
        controllerPath = controllerPath.substring(2);
      }
      
      let controllerFilePath = path.join(__dirname, '..', controllerPath);
      if (!controllerFilePath.endsWith('.js')) {
        controllerFilePath += '.js';
      }
      
      if (!fs.existsSync(controllerFilePath)) {
        console.log(`❌ Controller file not found: ${controllerFilePath}`);
        allRoutesValid = false;
        continue;
      }
      
      console.log(`✅ Controller file found: ${path.basename(controllerFilePath)}`);
      
      const controllerContent = fs.readFileSync(controllerFilePath, 'utf8');
      
      // Extract route handlers
      const routeMatches = routeContent.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"](?:[^,]*,\s*)?(\w+Controller)\.(\w+)/g);
      const handlers = Array.from(routeMatches).map(match => match[4]);
      
      console.log(`Found ${handlers.length} route handlers`);
      
      // Extract controller methods
      const methodMatches = controllerContent.matchAll(/async\s+(\w+)\s*\([^)]*\)\s*{/g);
      const methods = Array.from(methodMatches).map(match => match[1]);
      
      // Check if all route handlers have corresponding controller methods
      const missingMethods = handlers.filter(handler => !methods.includes(handler));
      
      if (missingMethods.length > 0) {
        console.log(`❌ Missing controller methods: ${missingMethods.join(', ')}`);
        allRoutesValid = false;
      } else {
        console.log('✅ All route handlers have corresponding controller methods');
      }
      
      // Check if required routes are implemented
      if (requiredRoutes[routeFile]) {
        const requiredHandlers = requiredRoutes[routeFile];
        const missingRequiredHandlers = requiredHandlers.filter(required => 
          !handlers.some(handler => handler.toLowerCase().includes(required.toLowerCase()))
        );
        
        if (missingRequiredHandlers.length > 0) {
          console.log(`❌ Missing required route handlers: ${missingRequiredHandlers.join(', ')}`);
          allRoutesValid = false;
        } else {
          console.log('✅ All required route handlers are implemented');
        }
      }
    }
    
    testResults.routeValidation = allRoutesValid;
    
    if (allRoutesValid) {
      console.log('\n✅ All routes and controllers are valid');
    } else {
      console.log('\n⚠️ Some routes or controllers have issues');
    }
    
    return allRoutesValid;
  } catch (error) {
    console.error('❌ Route validation failed:', error.message);
    testResults.errors.push('Route validation failed: ' + error.message);
    return false;
  }
}

// Generate test report
function generateReport() {
  console.log('\n=== COCONATURE E-COMMERCE TEST REPORT ===');
  console.log(`Test Date: ${new Date().toLocaleString()}`);
  console.log('\nTest Results:');
  console.log(`1. Database Connection: ${testResults.dbConnection ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`2. Test Data Population: ${testResults.dataPopulation ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`3. Database Relationship Validation: ${testResults.relationshipValidation ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`4. Routes and Controllers Validation: ${testResults.routeValidation ? '✅ PASSED' : '❌ FAILED'}`);
  
  const overallResult = 
    testResults.dbConnection && 
    testResults.dataPopulation && 
    testResults.relationshipValidation && 
    testResults.routeValidation;
  
  console.log(`\nOverall Test Result: ${overallResult ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\nErrors encountered:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  console.log('\nTest Accounts Created:');
  console.log('- Admin: admin@coconature.com / Admin@123');
  console.log('- Customer: customer@example.com / Customer@123');
  
  console.log('\n=== END OF REPORT ===');
}

// Main function
async function runTests() {
  console.log('=== COCONATURE E-COMMERCE TEST SUITE ===');
  console.log('Starting comprehensive tests...\n');
  
  try {
    // Connect to database
    const isConnected = await connectToDatabase();
    if (!isConnected) return;
    
    // Clear database
    await clearDatabase();
    
    // Populate test data
    await populateTestData();
    
    // Validate relationships
    await validateRelationships();
    
    // Validate routes
    try {
      await validateRoutes();
    } catch (error) {
      console.error('Error validating routes:', error.message);
      testResults.errors.push('Route validation failed: ' + error.message);
      testResults.routeValidation = false;
    }
    
    // Generate report
    generateReport();
  } catch (error) {
    console.error('\nUnexpected error during testing:', error);
    testResults.errors.push('Unexpected error: ' + error.message);
    generateReport();
  } finally {
    // Disconnect from database
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run tests
runTests();
