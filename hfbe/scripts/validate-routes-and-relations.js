/**
 * Route Validation Script
 * This script checks that all routes are correctly implemented
 * and tests the relationships between different models in the database
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
const Order = require('../models/Order');

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

// Validate database relationships
async function validateDatabaseRelationships() {
  try {
    console.log('Validating database relationships...');
    
    // Get a customer account
    const customer = await Account.findOne({ role: 'customer' });
    if (!customer) {
      console.log('❌ No customer account found');
      return false;
    }
    console.log(`✅ Found customer account: ${customer.email}`);
    
    // Check if customer has a cart
    const cart = await Cart.findOne({ user: customer._id }).populate('items.product');
    if (!cart) {
      console.log('❌ Customer does not have a cart');
      return false;
    }
    console.log(`✅ Customer has a cart with ${cart.items.length} items`);
    
    // Check if cart items reference valid products
    for (const item of cart.items) {
      if (!item.product) {
        console.log('❌ Cart item references invalid product');
        return false;
      }
    }
    console.log('✅ All cart items reference valid products');
    
    // Check if customer has a wishlist
    const wishlist = await Wishlist.findOne({ user: customer._id }).populate('products');
    if (!wishlist) {
      console.log('❌ Customer does not have a wishlist');
      return false;
    }
    console.log(`✅ Customer has a wishlist with ${wishlist.products.length} products`);
    
    // Check if customer has addresses
    const addresses = await Address.find({ user: customer._id });
    if (addresses.length === 0) {
      console.log('❌ Customer does not have any addresses');
      return false;
    }
    console.log(`✅ Customer has ${addresses.length} addresses`);
    
    // Check if customer has orders
    const orders = await Order.find({ user: customer._id })
      .populate('items.product')
      .populate('address');
    
    if (orders.length === 0) {
      console.log('❌ Customer does not have any orders');
      return false;
    }
    console.log(`✅ Customer has ${orders.length} orders`);
    
    // Validate order relationships
    for (const order of orders) {
      // Check if order has items
      if (!order.items || order.items.length === 0) {
        console.log(`❌ Order #${order.orderNumber} does not have any items`);
        return false;
      }
      
      // Check if order has a valid address
      if (!order.address) {
        console.log(`❌ Order #${order.orderNumber} does not have a valid address`);
        return false;
      }
    }
    console.log('✅ All orders have valid items and addresses');
    
    // Validate products have categories
    const products = await Product.find().populate('category');
    for (const product of products) {
      if (!product.category) {
        console.log(`❌ Product ${product.name} does not have a valid category`);
        return false;
      }
    }
    console.log('✅ All products have valid categories');
    
    console.log('\n✅ All database relationships are valid!');
    return true;
  } catch (error) {
    console.error('Error validating database relationships:', error);
    return false;
  }
}

// Check if all route handlers match controller methods
function validateRouteHandlers() {
  try {
    console.log('\nValidating route handlers...');
    
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
        { method: 'get', path: '/category/:categoryId' }
      ],
      'cartRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'post', path: '/' },
        { method: 'patch', path: '/' },
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
        { method: 'post', path: '/' }
      ],
      'addressRoutes.js': [
        { method: 'get', path: '/' },
        { method: 'post', path: '/' },
        { method: 'put', path: '/:id' },
        { method: 'delete', path: '/:id' }
      ]
    };
    
    // Read route files
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('Routes.js'));
    
    let allRoutesValid = true;
    
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
      
      console.log(`Found ${extractedRoutes.length} routes`);
      
      // Check if required routes exist
      if (requiredRoutes[routeFile]) {
        const missingRoutes = requiredRoutes[routeFile].filter(required => {
          return !extractedRoutes.some(route => 
            route.method.toLowerCase() === required.method.toLowerCase() && 
            route.path === required.path
          );
        });
        
        if (missingRoutes.length > 0) {
          console.log(`❌ Missing ${missingRoutes.length} required routes in ${routeFile}:`);
          missingRoutes.forEach(route => {
            console.log(`   - ${route.method.toUpperCase()} ${route.path}`);
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
        console.log(`✅ All required methods found in ${controllerName}`);
      }
    }
    
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

// Main function to run all validations
async function runValidations() {
  try {
    const isConnected = await connectToDatabase();
    if (!isConnected) return;
    
    console.log('Starting validation of database and routes...\n');
    
    // Validate route handlers first (static analysis)
    const routesValid = validateRouteHandlers();
    
    // Then validate database relationships (needs database connection)
    const relationshipsValid = await validateDatabaseRelationships();
    
    if (routesValid && relationshipsValid) {
      console.log('\n✅ All validations passed!');
    } else {
      console.log('\n❌ Some validations failed.');
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
