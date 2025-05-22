// filepath: d:\Hang_ngoo\web\hfbe\scripts\improved-validation.js
/**
 * Improved Validation Script for CocoNature E-commerce
 * 
 * This script validates:
 * 1. Database relationships between all entities
 * 2. Routes match controller methods
 * 3. Data integrity across models
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
const OrderItem = require('../models/OrderItem');
const Billing = require('../models/Billing');
const Discount = require('../models/Discount');
const Review = require('../models/Review');
const PaymentMethod = require('../models/PaymentMethod');

// Results tracking
const results = {
  relationships: {
    passed: 0,
    failed: 0,
    details: []
  },
  routes: {
    passed: 0,
    failed: 0,
    details: []
  }
};

// Connect to MongoDB
async function connectToDatabase() {
  console.log('Connecting to MongoDB database...');
  
  await mongoose.connect('mongodb://127.0.0.1:27017/hanfoods', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  console.log('Connected to MongoDB database successfully');
}

// Validate database relationships
async function validateRelationships() {
  console.log('\n=== VALIDATING DATABASE RELATIONSHIPS ===');
  
  try {
    // 1. User-Cart relationships
    console.log('\n1. Checking User-Cart relationships:');
    const customers = await Account.find({ role: 'customer' });
    
    for (const customer of customers) {
      const cart = await Cart.findOne({ userId: customer._id });
      
      if (!cart) {
        console.log(`❌ Customer ${customer.email} does not have a cart`);
        results.relationships.failed++;
        results.relationships.details.push(`Customer ${customer.email} has no cart`);
      } else {
        console.log(`✅ Customer ${customer.email} has a cart with ${cart.items.length} items`);
        results.relationships.passed++;
        
        // Check if cart items reference valid products
        if (cart.items && cart.items.length > 0) {
          for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
              console.log(`❌ Cart item references invalid product ID: ${item.productId}`);
              results.relationships.failed++;
              results.relationships.details.push(`Cart for ${customer.email} has invalid product reference`);
            } else {
              results.relationships.passed++;
            }
          }
        }
      }
    }
    
    // 2. User-Wishlist relationships
    console.log('\n2. Checking User-Wishlist relationships:');
    for (const customer of customers) {
      const wishlists = await Wishlist.find({ userId: customer._id });
      
      if (wishlists.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any wishlist items`);
        results.relationships.failed++;
        results.relationships.details.push(`Customer ${customer.email} has no wishlist items`);
      } else {
        console.log(`✅ Customer ${customer.email} has ${wishlists.length} wishlist items`);
        results.relationships.passed++;
        
        // Check wishlist products
        for (const wishlist of wishlists) {
          const product = await Product.findById(wishlist.productId);
          if (!product) {
            console.log(`❌ Wishlist item references invalid product ID: ${wishlist.productId}`);
            results.relationships.failed++;
            results.relationships.details.push(`Wishlist for ${customer.email} has invalid product reference`);
          } else {
            results.relationships.passed++;
          }
        }
      }
    }
    
    // 3. User-Address relationships
    console.log('\n3. Checking User-Address relationships:');
    for (const customer of customers) {
      const addresses = await Address.find({ userId: customer._id });
      
      if (addresses.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any addresses`);
        results.relationships.failed++;
        results.relationships.details.push(`Customer ${customer.email} has no addresses`);
      } else {
        console.log(`✅ Customer ${customer.email} has ${addresses.length} addresses`);
        results.relationships.passed++;
        
        // Check default address
        const defaultAddresses = addresses.filter(addr => addr.isDefault);
        if (defaultAddresses.length !== 1) {
          console.log(`❌ Customer ${customer.email} has ${defaultAddresses.length} default addresses (should be 1)`);
          results.relationships.failed++;
          results.relationships.details.push(`Customer ${customer.email} has ${defaultAddresses.length} default addresses`);
        } else {
          results.relationships.passed++;
        }
      }
    }
    
    // 4. User-Order relationships
    console.log('\n4. Checking User-Order relationships:');
    for (const customer of customers) {
      const orders = await Order.find({ userId: customer._id });
      
      if (orders.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any orders`);
        results.relationships.failed++;
        results.relationships.details.push(`Customer ${customer.email} has no orders`);
      } else {
        console.log(`✅ Customer ${customer.email} has ${orders.length} orders`);
        results.relationships.passed++;
        
        // Check order items
        for (const order of orders) {
          const orderItems = await OrderItem.find({ orderId: order._id });
          
          if (orderItems.length === 0) {
            console.log(`❌ Order ${order.orderId} does not have any items`);
            results.relationships.failed++;
            results.relationships.details.push(`Order ${order.orderId} has no items`);
          } else {
            console.log(`✅ Order ${order.orderId} has ${orderItems.length} items`);
            results.relationships.passed++;
            
            // Check product references
            for (const item of orderItems) {
              const product = await Product.findById(item.productId);
              if (!product) {
                console.log(`❌ Order item references invalid product ID: ${item.productId}`);
                results.relationships.failed++;
                results.relationships.details.push(`Order item in ${order.orderId} has invalid product reference`);
              } else {
                results.relationships.passed++;
              }
            }
          }
          
          // Check billing record
          const billing = await Billing.findOne({ orderId: order._id });
          if (!billing) {
            console.log(`❌ Order ${order.orderId} does not have a billing record`);
            results.relationships.failed++;
            results.relationships.details.push(`Order ${order.orderId} has no billing record`);
          } else {
            console.log(`✅ Order ${order.orderId} has a billing record`);
            results.relationships.passed++;
          }
        }
      }
    }
    
    // 5. Product-Category relationships
    console.log('\n5. Checking Product-Category relationships:');
    const products = await Product.find();
    
    for (const product of products) {
      const category = await Category.findById(product.categoryId);
      
      if (!category) {
        console.log(`❌ Product ${product.name} (${product.productId}) has invalid category reference`);
        results.relationships.failed++;
        results.relationships.details.push(`Product ${product.productId} has invalid category reference`);
      } else {
        console.log(`✅ Product ${product.name} belongs to category ${category.name}`);
        results.relationships.passed++;
      }
    }
    
    console.log('\n=== RELATIONSHIP VALIDATION SUMMARY ===');
    console.log(`Passed checks: ${results.relationships.passed}`);
    console.log(`Failed checks: ${results.relationships.failed}`);
    
    return results.relationships.failed === 0;
  } catch (error) {
    console.error('Error validating relationships:', error);
    results.relationships.details.push(`Error: ${error.message}`);
    return false;
  }
}

// Validate routes and controllers
async function validateRoutes() {
  console.log('\n=== VALIDATING ROUTES AND CONTROLLERS ===');
  
  try {
    // Read route files
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
    
    console.log(`Found ${routeFiles.length} route files`);
    
    for (const routeFile of routeFiles) {
      console.log(`\nChecking route file: ${routeFile}`);
      const routePath = path.join(routesDir, routeFile);
      const routeContent = fs.readFileSync(routePath, 'utf8');
      
      // Extract controller import
      const controllerMatch = routeContent.match(/const\s+(\w+Controller)\s+=\s+require\(['"]([^'"]+)['"]\)/);
      
      if (!controllerMatch) {
        console.log(`❌ Could not find controller import in ${routeFile}`);
        results.routes.failed++;
        results.routes.details.push(`No controller import found in ${routeFile}`);
        continue;
      }
      
      const controllerName = controllerMatch[1];
      const controllerImportPath = controllerMatch[2];
      
      // Find controller file - try multiple possible locations
      let controllerFilePath;
      const possiblePaths = [
        path.resolve(path.join(routesDir, controllerImportPath + '.js')),
        path.resolve(path.join(routesDir, controllerImportPath)),
        path.resolve(path.join(__dirname, '..', controllerImportPath.replace('./', '') + '.js')),
        path.resolve(path.join(__dirname, '..', controllerImportPath.replace('./', ''))),
        path.resolve(path.join(__dirname, '..', 'controllers', controllerName + '.js')),
        path.resolve(path.join(__dirname, '..', 'controllers', controllerName))
      ];
      
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          controllerFilePath = possiblePath;
          break;
        }
      }
      
      if (!controllerFilePath) {
        console.log(`❌ Could not find controller file for ${controllerName}`);
        console.log(`   Tried paths:`, possiblePaths);
        results.routes.failed++;
        results.routes.details.push(`Controller file not found for ${controllerName}`);
        continue;
      }
      
      console.log(`✅ Found controller file: ${path.relative(path.join(__dirname, '..'), controllerFilePath)}`);
      
      // Read controller file
      const controllerContent = fs.readFileSync(controllerFilePath, 'utf8');
      
      // Extract routes from route file
      const routePatterns = [
        // Standard express route patterns
        /router\.(get|post|put|patch|delete)\s*\(\s*['"]([^'"]+)['"]\s*,\s*(?:[^,]+,\s*)*(\w+)\.(\w+)/g,
        // API route pattern with versioning
        /router\.(get|post|put|patch|delete)\s*\(\s*['"](\/api\/v\d+\/[^'"]+)['"]\s*,\s*(?:[^,]+,\s*)*(\w+)\.(\w+)/g
      ];
      
      const routeMethods = new Set();
      
      for (const routePattern of routePatterns) {
        const matches = routeContent.matchAll(routePattern);
        for (const match of matches) {
          const httpMethod = match[1];
          const routePath = match[2];
          const controllerVarName = match[3];
          const methodName = match[4];
          
          if (controllerVarName === controllerName) {
            routeMethods.add(methodName);
            
            // Check if method exists in controller
            const methodExists = new RegExp(`${methodName}\\s*=\\s*(async\\s+)?\\(?`).test(controllerContent);
            
            if (methodExists) {
              console.log(`✅ Route ${httpMethod.toUpperCase()} ${routePath} maps to existing controller method ${controllerName}.${methodName}`);
              results.routes.passed++;
            } else {
              console.log(`❌ Route ${httpMethod.toUpperCase()} ${routePath} references non-existent controller method ${controllerName}.${methodName}`);
              results.routes.failed++;
              results.routes.details.push(`Missing controller method: ${controllerName}.${methodName}`);
            }
          }
        }
      }
      
      if (routeMethods.size === 0) {
        console.log(`❓ No route handlers found for ${controllerName} in ${routeFile}`);
        results.routes.failed++;
        results.routes.details.push(`No route handlers found for ${controllerName}`);
      }
    }
    
    console.log('\n=== ROUTE VALIDATION SUMMARY ===');
    console.log(`Passed checks: ${results.routes.passed}`);
    console.log(`Failed checks: ${results.routes.failed}`);
    
    return results.routes.failed === 0;
  } catch (error) {
    console.error('Error validating routes:', error);
    results.routes.details.push(`Error: ${error.message}`);
    return false;
  }
}

// Main validation function
async function runValidation() {
  console.log('=== COCONATURE E-COMMERCE VALIDATION ===');
  
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Validate database relationships
    const relationshipsValid = await validateRelationships();
    
    // Validate routes
    const routesValid = await validateRoutes();
    
    // Overall validation result
    const overallValid = relationshipsValid && routesValid;
    
    // Generate report
    console.log('\n=== VALIDATION REPORT ===');
    console.log(`Database Relationships: ${relationshipsValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Routes and Controllers: ${routesValid ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Overall Validation: ${overallValid ? '✅ PASSED' : '❌ FAILED'}`);
    
    // Show detailed errors if any
    if (results.relationships.failed > 0) {
      console.log('\nRelationship Validation Errors:');
      results.relationships.details.forEach((error, i) => {
        console.log(` ${i+1}. ${error}`);
      });
    }
    
    if (results.routes.failed > 0) {
      console.log('\nRoute Validation Errors:');
      results.routes.details.forEach((error, i) => {
        console.log(` ${i+1}. ${error}`);
      });
    }
    
    return overallValid;
  } catch (error) {
    console.error('Validation failed with error:', error);
    return false;
  } finally {
    // Disconnect from MongoDB
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run validation if script is executed directly
if (require.main === module) {
  runValidation()
    .then(valid => {
      console.log(`\nValidation ${valid ? 'succeeded' : 'failed'}`);
      process.exit(valid ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error during validation:', error);
      process.exit(1);
    });
} else {
  // Export for use in other scripts
  module.exports = {
    validateRelationships,
    validateRoutes,
    runValidation
  };
}
