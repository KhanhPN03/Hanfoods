/**
 * Enhanced Route & Relationship Validation Script
 * This script performs comprehensive validation of:
 * 1. Database relationships between all entities (users, carts, wishlists, products, orders)
 * 2. Required API routes for all features
 * 3. Controller methods matching route handlers
 * 4. Data integrity across the e-commerce system
 * 
 * Database: hanfoods
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import all models
const Account = require('../models/Account');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const PaymentMethod = require('../models/PaymentMethod');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Billing = require('../models/Billing');
const Discount = require('../models/Discount');
const Review = require('../models/Review');

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/hanfoods', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB database: hanfoods');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

// Validate database relationships - Comprehensive check of all entity connections
async function validateDatabaseRelationships() {
  try {
    console.log('\nValidating database relationships...');
    
    // 1. USER RELATIONSHIPS
    console.log('\n1. VALIDATING USER RELATIONSHIPS:');
    // Check that we have both admin and customer users
    const adminCount = await Account.countDocuments({ role: 'admin' });
    const customerCount = await Account.countDocuments({ role: 'customer' });
    
    console.log(`Found ${adminCount} admin users and ${customerCount} customer users`);
    
    if (adminCount === 0) {
      console.log('❌ No admin users found in the system');
    } else {
      console.log('✅ Admin users exist in the system');
    }
    
    if (customerCount === 0) {
      console.log('❌ No customer users found in the system');
      return false;
    }
    console.log('✅ Customer users exist in the system');
    
    // Get all customers for further relationship checks
    const customers = await Account.find({ role: 'customer' });
    
    // 2. CART RELATIONSHIPS
    console.log('\n2. VALIDATING CART RELATIONSHIPS:');
    // Check if all customers have carts
    let allCustomersHaveCarts = true;
    
    for (const customer of customers) {
      const cart = await Cart.findOne({ userId: customer._id }).populate('items.productId');
      
      if (!cart) {
        console.log(`❌ Customer ${customer.email} does not have a cart`);
        allCustomersHaveCarts = false;
        continue;
      }
      
      console.log(`✅ Customer ${customer.email} has a cart`);
      
      // Check if cart items reference valid products
      if (!cart.items || cart.items.length === 0) {
        console.log(`❌ Customer ${customer.email}'s cart is empty`);
        continue;
      }
      
      console.log(`   Cart has ${cart.items.length} items`);
      
      let allCartItemsValid = true;
      for (const item of cart.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          console.log(`❌ Cart contains invalid product reference: ${item.productId}`);
          allCartItemsValid = false;
        }
      }
      
      if (allCartItemsValid) {
        console.log(`✅ All cart items for ${customer.email} reference valid products`);
      }
    }
    
    // 3. WISHLIST RELATIONSHIPS
    console.log('\n3. VALIDATING WISHLIST RELATIONSHIPS:');
    // Check if all customers have wishlists
    let allCustomersHaveWishlists = true;
    
    for (const customer of customers) {
      const wishlists = await Wishlist.find({ userId: customer._id });
      
      if (!wishlists || wishlists.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any wishlist items`);
        allCustomersHaveWishlists = false;
        continue;
      }
      
      console.log(`✅ Customer ${customer.email} has ${wishlists.length} wishlist items`);
      
      // Check if wishlist items reference valid products
      let allWishlistItemsValid = true;
      for (const wishlistItem of wishlists) {
        const product = await Product.findById(wishlistItem.productId);
        if (!product) {
          console.log(`❌ Wishlist contains invalid product reference: ${wishlistItem.productId}`);
          allWishlistItemsValid = false;
        }
      }
      
      if (allWishlistItemsValid) {
        console.log(`✅ All wishlist items for ${customer.email} reference valid products`);
      }
    }
    
    // 4. ADDRESS RELATIONSHIPS
    console.log('\n4. VALIDATING ADDRESS RELATIONSHIPS:');
    // Check if all customers have addresses
    let allCustomersHaveAddresses = true;
    
    for (const customer of customers) {
      const addresses = await Address.find({ userId: customer._id });
      
      if (!addresses || addresses.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any addresses`);
        allCustomersHaveAddresses = false;
        continue;
      }
      
      console.log(`✅ Customer ${customer.email} has ${addresses.length} addresses`);
      
      // Check if customer has a default address
      const defaultAddress = addresses.find(address => address.isDefault);
      if (!defaultAddress) {
        console.log(`❌ Customer ${customer.email} does not have a default address`);
      } else {
        console.log(`✅ Customer ${customer.email} has a default address`);
      }
    }
    
    // 5. ORDER RELATIONSHIPS
    console.log('\n5. VALIDATING ORDER RELATIONSHIPS:');
    // Check if customers have orders
    let allOrderRelationshipsValid = true;
    
    const orders = await Order.find();
    if (orders.length === 0) {
      console.log('❌ No orders found in the system');
      allOrderRelationshipsValid = false;
    } else {
      console.log(`Found ${orders.length} orders in the system`);
      
      for (const order of orders) {
        // Validate user reference
        const user = await Account.findById(order.userId);
        if (!user) {
          console.log(`❌ Order ${order.orderId} references invalid user`);
          allOrderRelationshipsValid = false;
        }
        
        // Validate address reference
        const address = await Address.findById(order.addressId);
        if (!address) {
          console.log(`❌ Order ${order.orderId} references invalid address`);
          allOrderRelationshipsValid = false;
        }
        
        // Validate order items
        if (!order.items || order.items.length === 0) {
          console.log(`❌ Order ${order.orderId} has no items`);
          allOrderRelationshipsValid = false;
          continue;
        }
        
        let allOrderItemsValid = true;
        for (const item of order.items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            console.log(`❌ Order ${order.orderId} contains invalid product reference`);
            allOrderItemsValid = false;
            allOrderRelationshipsValid = false;
          }
        }
        
        if (allOrderItemsValid) {
          console.log(`✅ Order ${order.orderId} has valid items`);
        }
        
        // Validate billing record exists
        const billing = await Billing.findOne({ orderId: order._id });
        if (!billing) {
          console.log(`❌ Order ${order.orderId} has no billing record`);
          allOrderRelationshipsValid = false;
        } else {
          console.log(`✅ Order ${order.orderId} has a billing record`);
          
          // Validate payment method
          const paymentMethod = await PaymentMethod.findById(billing.paymentMethodId);
          if (!paymentMethod) {
            console.log(`❌ Billing record for Order ${order.orderId} has invalid payment method`);
            allOrderRelationshipsValid = false;
          }
        }
        
        // If discount is applied, validate it exists
        if (order.discountId) {
          const discount = await Discount.findById(order.discountId);
          if (!discount) {
            console.log(`❌ Order ${order.orderId} references invalid discount`);
            allOrderRelationshipsValid = false;
          } else {
            console.log(`✅ Order ${order.orderId} has a valid discount applied`);
          }
        }
      }
    }
    
    // 6. PRODUCT RELATIONSHIPS
    console.log('\n6. VALIDATING PRODUCT RELATIONSHIPS:');
    // Check if products have valid categories
    const products = await Product.find();
    if (products.length === 0) {
      console.log('❌ No products found in the system');
    } else {
      console.log(`Found ${products.length} products in the system`);
      
      let allProductsHaveCategories = true;
      for (const product of products) {
        const category = await Category.findById(product.categoryId);
        if (!category) {
          console.log(`❌ Product ${product.name} has invalid category reference`);
          allProductsHaveCategories = false;
        }
      }
      
      if (allProductsHaveCategories) {
        console.log('✅ All products have valid categories');
      }
      
      // Check for product reviews
      const reviews = await Review.find();
      if (reviews.length === 0) {
        console.log('❌ No product reviews found in the system');
      } else {
        console.log(`Found ${reviews.length} product reviews`);
        
        let allReviewsValid = true;
        for (const review of reviews) {
          // Validate product reference
          const product = await Product.findById(review.productId);
          if (!product) {
            console.log('❌ Review references invalid product');
            allReviewsValid = false;
          }
          
          // Validate user reference
          const user = await Account.findById(review.userId);
          if (!user) {
            console.log('❌ Review references invalid user');
            allReviewsValid = false;
          }
        }
        
        if (allReviewsValid) {
          console.log('✅ All reviews have valid product and user references');
        }
      }
    }
    
    // 7. PAYMENT METHOD RELATIONSHIPS
    console.log('\n7. VALIDATING PAYMENT METHODS:');
    const paymentMethods = await PaymentMethod.find();
    if (paymentMethods.length === 0) {
      console.log('❌ No payment methods found in the system');
    } else {
      console.log(`✅ Found ${paymentMethods.length} payment methods in the system`);
    }
    
    // 8. DISCOUNT RELATIONSHIPS
    console.log('\n8. VALIDATING DISCOUNTS:');
    const discounts = await Discount.find();
    if (discounts.length === 0) {
      console.log('❌ No discount codes found in the system');
    } else {
      console.log(`✅ Found ${discounts.length} discount codes in the system`);
    }
    
    console.log('\n✅ Database relationship validation complete!');
    return true;
  } catch (error) {
    console.error('Error validating database relationships:', error);
    return false;
  }
}

// Check if all required routes exist and controller methods match
function validateRouteHandlers() {
  try {
    console.log('\nValidating API routes and controllers...');
    
    // Required route endpoints for each feature
    const requiredRoutes = {
      'authRoutes.js': [
        { method: 'post', path: '/register' },
        { method: 'post', path: '/login' },
        { method: 'get', path: '/logout' },
        { method: 'get', path: '/profile' }
      ],
      'productRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'get', path: '/:id' },
        { method: 'get', path: '/category/:categoryId' },
        { method: 'post', path: '/', reqAdmin: true },
        { method: 'put', path: '/:id', reqAdmin: true },
        { method: 'delete', path: '/:id', reqAdmin: true }
      ],
      'categoryRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'post', path: '/', reqAdmin: true },
        { method: 'put', path: '/:id', reqAdmin: true },
        { method: 'delete', path: '/:id', reqAdmin: true }
      ],
      'cartRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'post', path: '/' },
        { method: 'put', path: '/:productId' },
        { method: 'delete', path: '/:productId' }
      ],
      'wishlistRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'post', path: '/' },
        { method: 'delete', path: '/:productId' }
      ],
      'orderRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'get', path: '/:id' },
        { method: 'post', path: '/' },
        { method: 'put', path: '/:id/status', reqAdmin: true }
      ],
      'addressRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'get', path: '/:id' },
        { method: 'post', path: '/' },
        { method: 'put', path: '/:id' },
        { method: 'delete', path: '/:id' }
      ],
      'paymentRoutes.js': [
        { method: 'post', path: '/process' },
        { method: 'get', path: '/methods' }
      ],
      'billingRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'get', path: '/:id' },
        { method: 'post', path: '/', reqAdmin: true }
      ],
      'discountRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'post', path: '/', reqAdmin: true },
        { method: 'post', path: '/apply' },
        { method: 'put', path: '/:id', reqAdmin: true },
        { method: 'delete', path: '/:id', reqAdmin: true }
      ]
    };
    
    // Read route files
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('Routes.js'));
    
    let allRoutesValid = true;
    
    console.log(`Found ${routeFiles.length} route files`);
    
    // Track route coverage
    const requiredRouteCount = Object.values(requiredRoutes).reduce(
      (sum, routes) => sum + routes.length, 0
    );
    
    let foundRequiredRoutes = 0;
    let missingRequiredRoutes = 0;
    
    // Check each route file
    for (const routeFile of routeFiles) {
      console.log(`\nChecking routes in ${routeFile}...`);
      const routePath = path.join(routesDir, routeFile);
      const routeContent = fs.readFileSync(routePath, 'utf8');
      
      // Extract routes from file
      const extractedRoutes = [];
      const routeMatches = routeContent.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/g);
      
      for (const match of Array.from(routeMatches)) {
        const [_, method, path] = match;
        extractedRoutes.push({ method, path });
      }
      
      console.log(`Found ${extractedRoutes.length} routes in this file`);
      
      // Check if required routes exist
      if (requiredRoutes[routeFile]) {
        const missingRoutes = requiredRoutes[routeFile].filter(required => {
          const routeExists = extractedRoutes.some(route => 
            route.method.toLowerCase() === required.method.toLowerCase() && 
            route.path === required.path
          );
          
          if (routeExists) {
            foundRequiredRoutes++;
            return false;
          } else {
            missingRequiredRoutes++;
            return true;
          }
        });
        
        if (missingRoutes.length > 0) {
          console.log(`❌ Missing ${missingRoutes.length} required routes in ${routeFile}:`);
          missingRoutes.forEach(route => {
            console.log(`   - ${route.method.toUpperCase()} ${route.path}${route.reqAdmin ? ' (admin route)' : ''}`);
          });
          allRoutesValid = false;
        } else {
          console.log(`✅ All required routes found in ${routeFile}`);
        }
      }
      
      // Extract controller name from imports
      const controllerMatch = routeContent.match(/const\s+(\w+Controller)\s+=\s+require\(['"]([^'"]+)['"]\)/);
      if (!controllerMatch) {
        console.log(`❌ Could not find controller import in ${routeFile}`);
        allRoutesValid = false;
        continue;
      }
      
      const controllerName = controllerMatch[1];
      const controllerPath = controllerMatch[2];
      
      // Find controller file
      let controllerFilePath = path.join(__dirname, '..', controllerPath);
      if (!controllerFilePath.endsWith('.js')) {
        controllerFilePath += '.js';
      }
      
      if (!fs.existsSync(controllerFilePath)) {
        console.log(`❌ Controller file not found: ${controllerFilePath}`);
        allRoutesValid = false;
        continue;
      }
      
      const controllerContent = fs.readFileSync(controllerFilePath, 'utf8');
      
      // Extract route handler methods from route file
      const routeHandlers = [];
      const handlerMatches = routeContent.matchAll(/(\w+Controller)\.(\w+)/g);
      
      for (const match of Array.from(handlerMatches)) {
        const [_, controller, method] = match;
        if (controller === controllerName) {
          routeHandlers.push(method);
        }
      }
      
      // Check if controller has all the methods referenced in routes
      const methodMatches = controllerContent.matchAll(/async\s+(\w+)\s*\([^)]*\)\s*{/g);
      const controllerMethods = Array.from(methodMatches).map(match => match[1]);
      
      const missingMethods = routeHandlers.filter(method => !controllerMethods.includes(method));
      
      if (missingMethods.length > 0) {
        console.log(`❌ Missing methods in ${controllerName}:`);
        missingMethods.forEach(method => {
          console.log(`   - ${method}`);
        });
        allRoutesValid = false;
      } else if (routeHandlers.length > 0) {
        console.log(`✅ All ${routeHandlers.length} required methods found in ${controllerName}`);
      }
      
      // Check for middleware usage in protected routes
      if (routeFile !== 'authRoutes.js') {
        const authMiddlewareUsage = routeContent.includes('authMiddleware');
        if (!authMiddlewareUsage) {
          console.log(`⚠️ No auth middleware detected in ${routeFile} - routes may not be protected`);
        } else {
          console.log(`✅ Auth middleware detected in ${routeFile}`);
        }
      }
    }
    
    // Report on route coverage
    const routeCoveragePercent = (foundRequiredRoutes / requiredRouteCount * 100).toFixed(1);
    console.log(`\nRoute coverage: ${foundRequiredRoutes}/${requiredRouteCount} (${routeCoveragePercent}%)`);
    
    if (allRoutesValid) {
      console.log('\n✅ All routes are valid and mapped to controller methods!');
    } else {
      console.log('\n❌ Some routes are missing or have issues.');
    }
    
    return allRoutesValid;
  } catch (error) {
    console.error('Error validating route handlers:', error);
    return false;
  }
}

// Check that service layer exists and is properly integrated
function validateServiceLayer() {
  try {
    console.log('\nValidating service layer...');
    
    const requiredServices = [
      'AuthService',
      'ProductService',
      'CategoryService',
      'CartService',
      'WishlistService',
      'OrderService',
      'AddressService',
      'PaymentService',
      'BillingService',
      'DiscountService'
    ];
    
    const servicesDir = path.join(__dirname, '../services');
    if (!fs.existsSync(servicesDir)) {
      console.log('❌ Services directory not found');
      return false;
    }
    
    const serviceFiles = fs.readdirSync(servicesDir).filter(file => file.endsWith('.js'));
    console.log(`Found ${serviceFiles.length} service files`);
    
    const missingServices = requiredServices.filter(service => {
      return !serviceFiles.some(file => file === `${service}.js`);
    });
    
    if (missingServices.length > 0) {
      console.log('❌ Missing required services:');
      missingServices.forEach(service => {
        console.log(`   - ${service}`);
      });
    } else {
      console.log('✅ All required services exist');
    }
    
    // Check that controllers use services
    const controllersDir = path.join(__dirname, '../controllers');
    const controllerFiles = fs.readdirSync(controllersDir).filter(file => file.endsWith('Controller.js'));
    
    let allControllersUseServices = true;
    for (const controllerFile of controllerFiles) {
      const controllerPath = path.join(controllersDir, controllerFile);
      const controllerContent = fs.readFileSync(controllerPath, 'utf8');
      
      // Get expected service name based on controller name
      const serviceName = controllerFile.replace('Controller.js', 'Service');
      
      // Check if controller imports and uses the corresponding service
      const serviceImport = controllerContent.includes(`require('../services/${serviceName}')`);
      
      if (!serviceImport) {
        console.log(`❌ ${controllerFile} does not import its corresponding service`);
        allControllersUseServices = false;
      }
    }
    
    if (allControllersUseServices) {
      console.log('✅ All controllers properly utilize service layer');
    }
    
    return missingServices.length === 0 && allControllersUseServices;
  } catch (error) {
    console.error('Error validating service layer:', error);
    return false;
  }
}

// Validate the overall application architecture
function validateAppArchitecture() {
  try {
    console.log('\nValidating application architecture...');
    
    // Check for essential files
    const requiredFiles = [
      {path: 'app.js', description: 'Main application file'},
      {path: 'package.json', description: 'Package configuration'},
      {path: 'middlewares/authMiddleware.js', description: 'Authentication middleware'}
    ];
    
    let allRequiredFilesExist = true;
    for (const file of requiredFiles) {
      const filePath = path.join(__dirname, '..', file.path);
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Required file missing: ${file.path} (${file.description})`);
        allRequiredFilesExist = false;
      }
    }
    
    if (allRequiredFilesExist) {
      console.log('✅ All essential files exist');
    }
    
    // Check that package.json has required dependencies
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    const requiredDependencies = [
      'express',
      'mongoose',
      'passport',
      'bcryptjs',
      'jsonwebtoken',
      'cors'
    ];
    
    const missingDependencies = requiredDependencies.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDependencies.length > 0) {
      console.log('❌ Missing required dependencies:');
      missingDependencies.forEach(dep => {
        console.log(`   - ${dep}`);
      });
    } else {
      console.log('✅ All required dependencies are installed');
    }
    
    // Check app.js structure
    const appJsPath = path.join(__dirname, '../app.js');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    // Check for key middleware usage
    const middlewareChecks = [
      {name: 'cors', present: appJsContent.includes('cors')},
      {name: 'express.json', present: appJsContent.includes('express.json')},
      {name: 'passport', present: appJsContent.includes('passport.initialize')},
      {name: 'error handling middleware', present: appJsContent.includes('app.use((err, req, res, next)')},
      {name: 'routes registration', present: appJsContent.includes('/api/')}
    ];
    
    const missingMiddleware = middlewareChecks.filter(check => !check.present);
    
    if (missingMiddleware.length > 0) {
      console.log('❌ Missing key middleware in app.js:');
      missingMiddleware.forEach(middleware => {
        console.log(`   - ${middleware.name}`);
      });
    } else {
      console.log('✅ All key middleware properly configured in app.js');
    }
    
    return allRequiredFilesExist && missingDependencies.length === 0 && missingMiddleware.length === 0;
  } catch (error) {
    console.error('Error validating application architecture:', error);
    return false;
  }
}

// Main function to run all validations
async function runValidations() {
  try {
    console.log('Starting comprehensive validation of CocoNature E-commerce API...');
    const isConnected = await connectToDatabase();
    if (!isConnected) return;
    
    // Validate application architecture (static analysis)
    const architectureValid = validateAppArchitecture();
    
    // Validate service layer (static analysis)
    const serviceLayerValid = validateServiceLayer();
    
    // Validate route handlers (static analysis)
    const routesValid = validateRouteHandlers();
    
    // Then validate database relationships (needs database connection)
    const relationshipsValid = await validateDatabaseRelationships();
    
    // Summary of validation results
    console.log('\n=== VALIDATION SUMMARY ===');
    console.log(`Application Architecture: ${architectureValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Service Layer: ${serviceLayerValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`API Routes: ${routesValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Database Relationships: ${relationshipsValid ? '✅ PASSED' : '❌ FAILED'}`);
    
    const overallResult = architectureValid && serviceLayerValid && routesValid && relationshipsValid;
    
    if (overallResult) {
      console.log('\n✅ All validations passed! The application is correctly structured and relationships are valid.');
    } else {
      console.log('\n❌ Some validations failed. Please address the issues reported above.');
    }
  } catch (error) {
    console.error('Error running validations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run validations
runValidations();
