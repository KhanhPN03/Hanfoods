/**
 * CocoNature E-commerce Test Scenario Script
 * This script creates a complete test scenario with data relationships:
 * - Creates users
 * - Creates categories and products
 * - Creates carts and wishlists for users
 * - Creates addresses for users
 * - Creates orders with items linked to products
 * - Creates payment records for orders
 * 
 * Database: hanfoods
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

// Import services (these handle business logic)
const AuthService = require('../services/AuthService');
const ProductService = require('../services/ProductService');
const CartService = require('../services/CartService');
const WishlistService = require('../services/WishlistService');

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

// Clear all collections to start fresh
async function clearDatabase() {
  console.log('Clearing existing data...');
  
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
  
  console.log('All collections cleared');
}

// Seed test data
async function seedDatabase() {
  try {
    // Connect to database
    const isConnected = await connectToDatabase();
    if (!isConnected) return;
    
    // Clear existing data
    await clearDatabase();
    
    console.log('Seeding database with test scenario data...');
    
    // 1. Create categories first
    console.log('Step 1: Creating categories...');
    const categories = await Category.create([
      { 
        name: 'Thực phẩm chức năng',
        description: 'Các sản phẩm thực phẩm chức năng cho sức khỏe',
        image: 'https://example.com/images/functional-food.jpg'
      },
      { 
        name: 'Trà thảo mộc', 
        description: 'Các loại trà thảo mộc tự nhiên',
        image: 'https://example.com/images/herbal-tea.jpg'
      },
      { 
        name: 'Mỹ phẩm thiên nhiên', 
        description: 'Các sản phẩm mỹ phẩm từ thiên nhiên',
        image: 'https://example.com/images/natural-cosmetics.jpg'
      }
    ]);
    console.log(`Created ${categories.length} categories`);
    
    // 2. Create products in each category
    console.log('Step 2: Creating products...');
    const products = await Product.create([
      {
        name: 'Trà Sen Tây Hồ',
        price: 120000,
        description: 'Trà sen Tây Hồ thơm ngon, giúp thanh lọc cơ thể',
        stock: 100,
        images: ['https://example.com/images/lotus-tea-1.jpg', 'https://example.com/images/lotus-tea-2.jpg'],
        category: categories[1]._id,
        featured: true,
        ratings: [
          { rating: 4, comment: 'Sản phẩm rất tốt' },
          { rating: 5, comment: 'Trà thơm ngon' }
        ]
      },
      {
        name: 'Mặt nạ dưỡng da trà xanh',
        price: 89000,
        description: 'Mặt nạ dưỡng da chiết xuất từ trà xanh tự nhiên',
        stock: 50,
        images: ['https://example.com/images/green-tea-mask-1.jpg', 'https://example.com/images/green-tea-mask-2.jpg'],
        category: categories[2]._id,
        featured: false,
        ratings: [
          { rating: 5, comment: 'Da mịn màng sau khi dùng' }
        ]
      },
      {
        name: 'Viên nghệ mật ong',
        price: 250000,
        description: 'Viên nghệ mật ong hỗ trợ sức khỏe đường tiêu hóa',
        stock: 75,
        images: ['https://example.com/images/turmeric-honey-1.jpg', 'https://example.com/images/turmeric-honey-2.jpg'],
        category: categories[0]._id,
        featured: true,
        ratings: [
          { rating: 5, comment: 'Sản phẩm hiệu quả' },
          { rating: 4, comment: 'Tốt cho sức khỏe' }
        ]
      }
    ]);
    console.log(`Created ${products.length} products`);
    
    // 3. Create payment methods
    console.log('Step 3: Creating payment methods...');
    const paymentMethods = await PaymentMethod.create([
      {
        name: 'Tiền mặt khi nhận hàng',
        description: 'Thanh toán bằng tiền mặt khi nhận được hàng'
      },
      {
        name: 'VietQR',
        description: 'Thanh toán trực tuyến qua VietQR'
      },
      {
        name: 'Thẻ tín dụng/ghi nợ',
        description: 'Thanh toán bằng thẻ tín dụng hoặc ghi nợ'
      }
    ]);
    console.log(`Created ${paymentMethods.length} payment methods`);
    
    // 4. Create discount codes
    console.log('Step 4: Creating discount codes...');
    const discountCodes = await Discount.create([
      {
        code: 'WELCOME20',
        type: 'percentage',
        value: 20,
        minOrderValue: 200000,
        maxDiscountAmount: 100000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
        isActive: true,
        usageLimit: 1,
        usageCount: 0
      },
      {
        code: 'FREESHIP',
        type: 'fixed',
        value: 30000,
        minOrderValue: 300000,
        maxDiscountAmount: 30000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 60)), // 60 days from now
        isActive: true,
        usageLimit: 100,
        usageCount: 0
      }
    ]);
    console.log(`Created ${discountCodes.length} discount codes`);
    
    // 5. Register users using AuthService (to properly hash passwords)
    console.log('Step 5: Creating users...');
    
    // Create admin user
    const adminUser = new Account({
      email: 'admin@coconature.com',
      username: 'admin',
      accountCode: 'ADMIN-' + uuidv4().substring(0, 8).toUpperCase(),
      role: 'admin',
      firstname: 'Admin',
      lastname: 'User',
      DOB: new Date('1990-01-01'),
      gender: 'male',
      phone: '0901234567'
    });
    await Account.register(adminUser, 'Admin@123');
    
    // Create customer user
    const customerUser = new Account({
      email: 'customer@example.com',
      username: 'customer',
      accountCode: 'CUST-' + uuidv4().substring(0, 8).toUpperCase(),
      role: 'customer',
      firstname: 'Nguyễn',
      lastname: 'Khách Hàng',
      DOB: new Date('1995-05-15'),
      gender: 'female',
      phone: '0912345678'
    });
    await Account.register(customerUser, 'Customer@123');
    
    console.log(`Created 2 users (1 admin, 1 customer)`);
    
    // 6. Create addresses for the customer
    console.log('Step 6: Creating addresses for customer...');
    const addresses = await Address.create([
      {
        user: customerUser._id,
        fullName: 'Nguyễn Khách Hàng',
        phone: '0912345678',
        province: 'Hà Nội',
        district: 'Cầu Giấy',
        ward: 'Dịch Vọng Hậu',
        street: '144 Xuân Thủy',
        isDefault: true
      },
      {
        user: customerUser._id,
        fullName: 'Nguyễn Khách Hàng',
        phone: '0912345678',
        province: 'Hà Nội',
        district: 'Đống Đa',
        ward: 'Láng Hạ',
        street: '29 Láng Hạ',
        isDefault: false
      }
    ]);
    console.log(`Created ${addresses.length} addresses for customer`);
    
    // 7. Create cart for the customer
    console.log('Step 7: Creating cart for customer...');
    const cart = new Cart({
      user: customerUser._id,
      items: [
        {
          product: products[0]._id,
          quantity: 2,
          price: products[0].price
        },
        {
          product: products[2]._id,
          quantity: 1,
          price: products[2].price
        }
      ]
    });
    
    // Calculate totals
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    await cart.save();
    
    console.log(`Created cart with ${cart.items.length} items`);
    
    // 8. Create wishlist for the customer
    console.log('Step 8: Creating wishlist for customer...');
    const wishlist = await Wishlist.create({
      user: customerUser._id,
      products: [products[1]._id]
    });
    console.log(`Created wishlist with ${wishlist.products.length} product`);
    
    // 9. Create an order for the customer
    console.log('Step 9: Creating order for customer...');
    
    // Calculate order details
    const orderItems = [
      {
        product: products[0]._id,
        name: products[0].name,
        quantity: 1,
        price: products[0].price
      },
      {
        product: products[1]._id,
        name: products[1].name,
        quantity: 2,
        price: products[1].price
      }
    ];
    
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 30000;
    
    // Apply discount
    let discountAmount = 0;
    if (subtotal >= discountCodes[0].minOrderValue) {
      discountAmount = Math.min(
        (subtotal * discountCodes[0].value) / 100,
        discountCodes[0].maxDiscountAmount
      );
    }
    
    const totalAmount = subtotal + shippingFee - discountAmount;
    
    // Create order
    const order = await Order.create({
      user: customerUser._id,
      items: orderItems,
      address: addresses[0]._id,
      paymentMethod: paymentMethods[0]._id, // COD
      status: 'processing',
      subtotal: subtotal,
      shippingFee: shippingFee,
      discount: discountCodes[0]._id,
      discountAmount: discountAmount,
      totalAmount: totalAmount,
      orderNumber: 'ORD-' + Date.now()
    });
    console.log(`Created order #${order.orderNumber} with ${orderItems.length} items`);
    
    // 10. Create billing record for the order
    console.log('Step 10: Creating billing record...');
    const billing = await Billing.create({
      order: order._id,
      user: customerUser._id,
      paymentMethod: paymentMethods[0]._id,
      amount: totalAmount,
      status: 'pending'
    });
    console.log(`Created billing record for order #${order.orderNumber}`);
    
    // Verify routes by checking controller methods match routes
    console.log('\nVerifying routes configuration...');
    await verifyRoutes();
    
    console.log('\nDatabase seeding completed successfully!');
    console.log('Test accounts created:');
    console.log('Admin - Email: admin@coconature.com, Password: Admin@123');
    console.log('Customer - Email: customer@example.com, Password: Customer@123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Verify that controllers have methods matching routes
async function verifyRoutes() {
  const fs = require('fs');
  const path = require('path');
  
  // Read route files
  const routesDir = path.join(__dirname, '../routes');
  const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('Routes.js'));
  
  console.log(`Found ${routeFiles.length} route files`);
  
  // Check each route file
  for (const routeFile of routeFiles) {
    const routePath = path.join(routesDir, routeFile);
    const routeContent = fs.readFileSync(routePath, 'utf8');
    
    // Extract controller name from imports
    const controllerMatch = routeContent.match(/const\s+(\w+Controller)\s+=\s+require\(['"]([^'"]+)['"]\)/);
    if (!controllerMatch) {
      console.log(`⚠️ Could not find controller import in ${routeFile}`);
      continue;
    }
    
    const controllerName = controllerMatch[1];
    const controllerPath = controllerMatch[2];
    
    // Find controller file
    const controllerFilePath = path.join(__dirname, '..', controllerPath.replace('./', ''));
    
    if (!fs.existsSync(controllerFilePath)) {
      console.log(`⚠️ Controller file not found: ${controllerFilePath}`);
      continue;
    }
    
    const controllerContent = fs.readFileSync(controllerFilePath, 'utf8');
    
    // Extract route handler methods from route file
    const routeHandlers = [];
    const routeMatches = routeContent.matchAll(/router\.(get|post|put|delete|patch)\(['"]([^'"]+)['"],\s*[^,]*,?\s*(\w+Controller)\.(\w+)\)/g);
    
    for (const match of routeMatches) {
      const [_, method, path, controller, handlerMethod] = match;
      routeHandlers.push({ method, path, controller, handlerMethod });
    }
    
    // Check if controller has all the methods referenced in routes
    const methodMatches = controllerContent.matchAll(/async\s+(\w+)\s*\([^)]*\)\s*{/g);
    const controllerMethods = Array.from(methodMatches).map(match => match[1]);
    
    const missingMethods = routeHandlers
      .filter(handler => handler.controller === controllerName && !controllerMethods.includes(handler.handlerMethod))
      .map(handler => handler.handlerMethod);
    
    if (missingMethods.length > 0) {
      console.log(`⚠️ Missing methods in ${controllerName}: ${missingMethods.join(', ')}`);
    } else {
      console.log(`✅ All route handlers found in ${controllerName}`);
    }
  }
}

// Run the seeding function
seedDatabase();
