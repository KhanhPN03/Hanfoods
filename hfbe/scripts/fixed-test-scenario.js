/**
 * Enhanced CocoNature E-commerce Test Scenario Script
 * This script creates a complete test scenario with comprehensive data relationships:
 * - Creates admin and customer users with account details
 * - Creates product categories (hierarchical) and products with complete details
 * - Creates carts and wishlists for users with product references
 * - Creates multiple addresses for users
 * - Creates orders with items that reference products from various categories
 * - Creates payment methods, billing records, and discount codes
 * - Tests various purchase scenarios (cash, online payment)
 * - Validates all relationships between entities
 * - Verifies routes and controller methods
 * 
 * Database: hanfoods
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
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

// Import services (these handle business logic)
const AuthService = require('../services/AuthService');
const ProductService = require('../services/ProductService');
const CartService = require('../services/CartService');
const WishlistService = require('../services/WishlistService');
const OrderService = require('../services/OrderService');
const AddressService = require('../services/AddressService');

// Store created entities to use in relationships
const createdEntities = {
  accounts: [],
  categories: [],
  products: [],
  carts: [],
  wishlists: [],
  addresses: [],
  paymentMethods: [],
  orders: [],
  billings: [],
  discounts: []
};

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB database: hanfoods...');
    await mongoose.connect('mongodb://127.0.0.1:27017/hanfoods', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Successfully connected to MongoDB database: hanfoods');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    console.error('MongoDB connection error details:', JSON.stringify(error, null, 2));
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
  await Review.deleteMany({});
  
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
    
    console.log('Seeding database with enhanced test scenario data...');
    
    // 1. Create Categories (hierarchical)
    console.log('\nStep 1: Creating categories with hierarchical structure...');
    
    // Main categories
    const mainCategories = await Category.create([
      { 
        categoryId: 'CAT-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Thực phẩm chức năng',
        description: 'Các sản phẩm thực phẩm chức năng cho sức khỏe',
        createdBy: null // Will update after admin creation
      },
      { 
        categoryId: 'CAT-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Trà thảo mộc', 
        description: 'Các loại trà thảo mộc tự nhiên',
        createdBy: null
      },
      { 
        categoryId: 'CAT-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Mỹ phẩm thiên nhiên', 
        description: 'Các sản phẩm mỹ phẩm từ thiên nhiên',
        createdBy: null
      }
    ]);
    
    createdEntities.categories = [...mainCategories];
    console.log(`Created ${mainCategories.length} main categories`);
    
    // 2. Create Users (Admin and Customers)
    console.log('\nStep 2: Creating admin and customer users...');
    
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
    
    // Create customer users (multiple customers)
    const customerUsers = [];
    
    // First customer
    const customer1 = new Account({
      email: 'nguyen.khachhang@example.com',
      username: 'customer1',
      accountCode: 'CUST-' + uuidv4().substring(0, 8).toUpperCase(),
      role: 'customer',
      firstname: 'Nguyễn',
      lastname: 'Khách Hàng',
      DOB: new Date('1995-05-15'),
      gender: 'female',
      phone: '0912345678'
    });
    await Account.register(customer1, 'Customer1@123');
    customerUsers.push(customer1);
    
    // Second customer
    const customer2 = new Account({
      email: 'tran.khachhang@example.com',
      username: 'customer2',
      accountCode: 'CUST-' + uuidv4().substring(0, 8).toUpperCase(),
      role: 'customer',
      firstname: 'Trần',
      lastname: 'Khách Hàng',
      DOB: new Date('1988-11-23'),
      gender: 'male',
      phone: '0923456789'
    });
    await Account.register(customer2, 'Customer2@123');
    customerUsers.push(customer2);
    
    createdEntities.accounts = [adminUser, ...customerUsers];
    console.log(`Created ${customerUsers.length + 1} users (1 admin, ${customerUsers.length} customers)`);
    
    // Update categories with admin as creator
    for (let category of createdEntities.categories) {
      category.createdBy = adminUser._id;
      await category.save();
    }
    console.log('Updated categories with admin as creator');
    
    // 3. Create Products within each Category
    console.log('\nStep 3: Creating products in each category...');
    const productsData = [
      // Category 1: Thực phẩm chức năng
      {
        productId: 'PRD-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Viên nghệ mật ong',
        description: 'Viên nghệ mật ong hỗ trợ sức khỏe đường tiêu hóa',
        price: 250000,
        salePrice: 225000,
        stock: 75,
        categoryId: mainCategories[0]._id,
        imageUrl: 'https://example.com/images/turmeric-honey.jpg',
        createdBy: adminUser._id
      },
      {
        productId: 'PRD-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Nấm linh chi đỏ',
        description: 'Nấm linh chi đỏ giúp tăng cường sức đề kháng',
        price: 350000,
        salePrice: 320000,
        stock: 50,
        categoryId: mainCategories[0]._id,
        imageUrl: 'https://example.com/images/red-ganoderma.jpg',
        createdBy: adminUser._id
      },
      
      // Category 2: Trà thảo mộc
      {
        productId: 'PRD-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Trà Sen Tây Hồ',
        description: 'Trà sen Tây Hồ thơm ngon, giúp thanh lọc cơ thể',
        price: 120000,
        salePrice: 110000,
        stock: 100,
        categoryId: mainCategories[1]._id,
        imageUrl: 'https://example.com/images/lotus-tea.jpg',
        createdBy: adminUser._id
      },
      {
        productId: 'PRD-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Trà Olong Thái Nguyên',
        description: 'Trà Olong thượng hạng từ Thái Nguyên',
        price: 180000,
        salePrice: 165000,
        stock: 80,
        categoryId: mainCategories[1]._id,
        imageUrl: 'https://example.com/images/oolong-tea.jpg',
        createdBy: adminUser._id
      },
      
      // Category 3: Mỹ phẩm thiên nhiên
      {
        productId: 'PRD-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Mặt nạ dưỡng da trà xanh',
        description: 'Mặt nạ dưỡng da chiết xuất từ trà xanh tự nhiên',
        price: 89000,
        salePrice: 75000,
        stock: 50,
        categoryId: mainCategories[2]._id,
        imageUrl: 'https://example.com/images/green-tea-mask.jpg',
        createdBy: adminUser._id
      },
      {
        productId: 'PRD-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Sữa rửa mặt nghệ',
        description: 'Sữa rửa mặt tinh chất nghệ giúp làm sáng da',
        price: 145000,
        salePrice: 130000,
        stock: 65,
        categoryId: mainCategories[2]._id,
        imageUrl: 'https://example.com/images/turmeric-facewash.jpg',
        createdBy: adminUser._id
      }
    ];
    
    // Save all products
    const products = await Product.create(productsData);
    createdEntities.products = products;
    console.log(`Created ${products.length} products across ${mainCategories.length} categories`);
    
    // 4. Create Reviews for Products
    console.log('\nStep 4: Creating product reviews...');
    const reviews = [];
    
    // Add reviews to various products from different customers
    for (let i = 0; i < products.length; i++) {
      // Each product gets 1-2 reviews
      const reviewCount = Math.floor(Math.random() * 2) + 1;
      
      for (let j = 0; j < reviewCount; j++) {
        // Alternate between customers for reviews
        const reviewer = customerUsers[j % customerUsers.length];
        
        reviews.push({
          reviewId: 'REV-' + uuidv4().substring(0, 8).toUpperCase(),
          productId: products[i]._id,
          userId: reviewer._id,
          rating: Math.floor(Math.random() * 3) + 3, // Random rating 3-5
          comment: `Sản phẩm ${j === 0 ? 'rất tốt' : 'chất lượng cao, đáng mua'}!`,
          createdBy: reviewer._id
        });
      }
    }
    
    await Review.create(reviews);
    console.log(`Created ${reviews.length} product reviews`);
    
    // 5. Create Payment Methods
    console.log('\nStep 5: Creating payment methods...');
    const paymentMethods = await PaymentMethod.create([
      {
        paymentMethodId: 'PAY-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Tiền mặt khi nhận hàng',
        description: 'Thanh toán bằng tiền mặt khi nhận được hàng',
        createdBy: adminUser._id
      },
      {
        paymentMethodId: 'PAY-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'VietQR',
        description: 'Thanh toán trực tuyến qua VietQR',
        createdBy: adminUser._id
      },
      {
        paymentMethodId: 'PAY-' + uuidv4().substring(0, 8).toUpperCase(),
        name: 'Thẻ tín dụng/ghi nợ',
        description: 'Thanh toán bằng thẻ tín dụng hoặc ghi nợ',
        createdBy: adminUser._id
      }
    ]);
    
    createdEntities.paymentMethods = paymentMethods;
    console.log(`Created ${paymentMethods.length} payment methods`);
    
    // 6. Create Discount Codes
    console.log('\nStep 6: Creating discount codes...');
    const discountCodes = await Discount.create([
      {
        discountId: 'DISC-' + uuidv4().substring(0, 8).toUpperCase(),
        code: 'WELCOME20',
        description: 'Giảm 20% cho đơn hàng đầu tiên',
        discountType: 'percentage',
        discountValue: 20,
        minOrderValue: 200000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
        createdBy: adminUser._id
      },
      {
        discountId: 'DISC-' + uuidv4().substring(0, 8).toUpperCase(),
        code: 'FREESHIP',
        description: 'Miễn phí vận chuyển cho đơn hàng trên 300k',
        discountType: 'fixed',
        discountValue: 30000,
        minOrderValue: 300000,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 60)), // 60 days from now
        createdBy: adminUser._id
      }
    ]);
    
    createdEntities.discounts = discountCodes;
    console.log(`Created ${discountCodes.length} discount codes`);
    
    // 7. Create Addresses for Customers
    console.log('\nStep 7: Creating addresses for customers...');
    
    // Create multiple addresses for each customer
    for (let customer of customerUsers) {
      const customerAddresses = await Address.create([
        {
          addressId: 'ADDR-' + uuidv4().substring(0, 8).toUpperCase(),
          userId: customer._id,
          street: customer === customer1 ? '144 Xuân Thủy' : '29 Láng Hạ',
          city: 'Hà Nội',
          state: customer === customer1 ? 'Cầu Giấy' : 'Đống Đa',
          country: 'Việt Nam',
          postalCode: customer === customer1 ? '100000' : '100010',
          isDefault: true,
          createdBy: customer._id
        },
        {
          addressId: 'ADDR-' + uuidv4().substring(0, 8).toUpperCase(),
          userId: customer._id,
          street: customer === customer1 ? '55 Nguyễn Chí Thanh' : '125 Chùa Láng',
          city: 'Hà Nội',
          state: customer === customer1 ? 'Đống Đa' : 'Đống Đa',
          country: 'Việt Nam',
          postalCode: customer === customer1 ? '100010' : '100020',
          isDefault: false,
          createdBy: customer._id
        }
      ]);
      
      createdEntities.addresses.push(...customerAddresses);
    }
    
    console.log(`Created ${createdEntities.addresses.length} addresses for customers`);
    
    // 8. Create Carts for Customers
    console.log('\nStep 8: Creating carts for customers...');
    
    const carts = [];
    for (let i = 0; i < customerUsers.length; i++) {
      const customer = customerUsers[i];
      
      // Select different products for each customer's cart
      const cartItems = [
        {
          productId: products[i % products.length]._id, 
          quantity: i + 1
        },
        {
          productId: products[(i + 2) % products.length]._id,
          quantity: 1
        }
      ];
      
      const cart = new Cart({
        cartId: 'CART-' + uuidv4().substring(0, 8).toUpperCase(),
        userId: customer._id,
        items: cartItems,
        deleted: false,
        createdBy: customer._id
      });
      
      await cart.save();
      carts.push(cart);
    }
    
    createdEntities.carts = carts;
    console.log(`Created ${carts.length} carts for customers`);
    
    // 9. Create Wishlists for Customers
    console.log('\nStep 9: Creating wishlists for customers...');
    
    const wishlists = [];
    for (let i = 0; i < customerUsers.length; i++) {
      const customer = customerUsers[i];
      
      // Add different products to each customer's wishlist
      // Choose products not in their cart
      const wishlistProduct = products[i === 0 ? 3 : 1];
      
      const wishlist = await Wishlist.create({
        wishlistId: 'WISH-' + uuidv4().substring(0, 8).toUpperCase(),
        userId: customer._id,
        productId: wishlistProduct._id,
        deleted: false,
        createdBy: customer._id
      });
      
      wishlists.push(wishlist);
    }
    
    createdEntities.wishlists = wishlists;
    console.log(`Created ${wishlists.length} wishlist items for customers`);
    
    // 10. Create Orders for Customers with different statuses and payment methods
    console.log('\nStep 10: Creating orders for customers...');
    
    const orders = [];
    const orderItems = [];
    const billings = [];
    
    // Create multiple orders for each customer with different statuses
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered'];
    
    for (let i = 0; i < customerUsers.length; i++) {
      const customer = customerUsers[i];
      
      // Create 2 orders for each customer
      for (let j = 0; j < 2; j++) {
        // Select different products for each order
        const orderProductIndices = [j, j + 2];
        const orderProducts = orderProductIndices.map(index => products[index % products.length]);
        
        // Select different payment methods
        const paymentMethod = paymentMethods[(i + j) % paymentMethods.length];
        
        // Create order
        const status = orderStatuses[(i + j) % orderStatuses.length];
        const address = createdEntities.addresses[i * 2]; // Get customer's default address
        
        // Calculate order values
        const items = orderProducts.map((product, idx) => {
          return {
            productId: product._id,
            name: product.name, 
            price: product.price,
            quantity: idx + 1,
            subtotal: product.price * (idx + 1)
          };
        });
        
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
        const shippingFee = 30000;
        
        // Apply discount if order value is high enough
        let discountAmount = 0;
        let discount = null;
        
        if (subtotal >= discountCodes[0].minOrderValue && j === 0) {
          discount = discountCodes[0]._id;
          discountAmount = Math.min(
            (subtotal * discountCodes[0].discountValue) / 100,
            100000 // Max discount cap
          );
        }
        
        const totalAmount = subtotal + shippingFee - discountAmount;
        
        // Create the order
        const order = await Order.create({
          orderId: 'ORD-' + Date.now() + '-' + uuidv4().substring(0, 4).toUpperCase(),
          userId: customer._id,
          totalAmount,
          status,
          addressId: address._id,
          items,
          discountId: discount,
          discountAmount,
          deleted: false,
          createdBy: customer._id
        });
        
        orders.push(order);
        
        // Create order items (detailed records for each product in the order)
        for (let k = 0; k < items.length; k++) {
          const item = items[k];
          const orderItem = await OrderItem.create({
            orderItemId: 'ITEM-' + uuidv4().substring(0, 8).toUpperCase(),
            orderId: order._id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            deleted: false,
            createdBy: customer._id
          });
          
          orderItems.push(orderItem);
        }
        
        // Create billing record for the order
        const billing = await Billing.create({
          billingId: 'BILL-' + uuidv4().substring(0, 8).toUpperCase(),
          orderId: order._id,
          paymentMethodId: paymentMethod._id,
          amount: totalAmount,
          status: j === 0 ? 'pending' : 'success', // First order pending, second success
          transactionId: j === 0 ? '' : 'TXN-' + uuidv4().substring(0, 8).toUpperCase(),
          deleted: false,
          createdBy: customer._id
        });
        
        billings.push(billing);
      }
    }
    
    createdEntities.orders = orders;
    createdEntities.billings = billings;
    
    console.log(`Created ${orders.length} orders with ${orderItems.length} order items`);
    console.log(`Created ${billings.length} billing records`);
    
    // 11. Verify Routes by checking controller methods
    console.log('\nStep 11: Verifying routes configuration...');
    await verifyRoutes();
    
    console.log('\nEnhanced database seeding completed successfully!');
    console.log('Test accounts created:');
    console.log('Admin - Email: admin@coconature.com, Password: Admin@123');
    console.log('Customer 1 - Email: nguyen.khachhang@example.com, Password: Customer1@123');
    console.log('Customer 2 - Email: tran.khachhang@example.com, Password: Customer2@123');
    
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
    const controllerPath = controllerMatch[2];    // Find controller file
    // First try with direct path (if path starts with .)
    let controllerFilePath;
    if (controllerPath.startsWith('./')) {
      controllerFilePath = path.join(__dirname, '..', controllerPath.replace('./', ''));
    } else if (controllerPath.startsWith('../')) {
      controllerFilePath = path.join(__dirname, '..', controllerPath);
    } else {
      // Try different common controller locations
      const possiblePaths = [
        path.join(__dirname, '..', controllerPath),
        path.join(__dirname, '..', 'controllers', controllerPath),
        path.join(__dirname, '..', 'controllers', `${controllerName}.js`)
      ];
      
      // Find the first path that exists
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          controllerFilePath = possiblePath;
          break;
        }
      }
      
      // If no path found, default to the original logic
      if (!controllerFilePath) {
        controllerFilePath = path.join(__dirname, '..', controllerPath);
      }
    }
    
    // Add .js extension if not already present
    if (controllerFilePath && !controllerFilePath.endsWith('.js')) {
      controllerFilePath += '.js';
    }
    
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
    
    // Check for required routes
    if (requiredRoutes[routeFile]) {
      const missingRoutes = requiredRoutes[routeFile].filter(required => {
        return !routeHandlers.some(handler => 
          handler.method.toLowerCase() === required.method.toLowerCase() && 
          handler.path === required.path
        );
      });
      
      if (missingRoutes.length > 0) {
        console.log(`⚠️ Missing ${missingRoutes.length} required routes in ${routeFile}:`);
        missingRoutes.forEach(route => {
          console.log(`   - ${route.method.toUpperCase()} ${route.path}`);
        });
      } else {
        console.log(`✅ All required routes found in ${routeFile}`);
      }
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

// Create a comprehensive validation function to verify database relationships
async function validateDatabaseRelationships() {
  try {
    console.log('\nStep 12: Validating database relationships...');
    
    // 1. Check that all customers have carts
    console.log('- Validating customer-cart relationships...');
    const customers = await Account.find({ role: 'customer' });
    
    for (const customer of customers) {
      const cart = await Cart.findOne({ userId: customer._id });
      if (!cart) {
        console.log(`❌ Customer ${customer.email} does not have a cart`);
      } else {
        console.log(`✅ Customer ${customer.email} has a cart with ${cart.items.length} items`);
        
        // Verify that cart items reference valid products
        for (const item of cart.items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            console.log(`❌ Cart item for customer ${customer.email} references invalid product`);
          }
        }
      }
    }
    
    // 2. Check that all customers have wishlists
    console.log('\n- Validating customer-wishlist relationships...');
    for (const customer of customers) {
      const wishlists = await Wishlist.find({ userId: customer._id });
      if (wishlists.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any wishlist items`);
      } else {
        console.log(`✅ Customer ${customer.email} has ${wishlists.length} wishlist items`);
        
        // Verify that wishlist items reference valid products
        for (const wishlistItem of wishlists) {
          const product = await Product.findById(wishlistItem.productId);
          if (!product) {
            console.log(`❌ Wishlist item for customer ${customer.email} references invalid product`);
          }
        }
      }
    }
    
    // 3. Check that all customers have addresses
    console.log('\n- Validating customer-address relationships...');
    for (const customer of customers) {
      const addresses = await Address.find({ userId: customer._id });
      if (addresses.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any addresses`);
      } else {
        console.log(`✅ Customer ${customer.email} has ${addresses.length} addresses`);
        
        // Check that at least one address is marked as default
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (!defaultAddress) {
          console.log(`❌ Customer ${customer.email} does not have a default address`);
        }
      }
    }
    
    // 4. Check that all customers have orders
    console.log('\n- Validating customer-order relationships...');
    for (const customer of customers) {
      const orders = await Order.find({ userId: customer._id });
      if (orders.length === 0) {
        console.log(`❌ Customer ${customer.email} does not have any orders`);
      } else {
        console.log(`✅ Customer ${customer.email} has ${orders.length} orders`);
        
        // Check that all orders have valid addresses
        for (const order of orders) {
          const address = await Address.findById(order.addressId);
          if (!address) {
            console.log(`❌ Order ${order.orderId} has invalid address`);
          }
          
          // Check that all order items reference valid products
          for (const item of order.items) {
            const product = await Product.findById(item.productId);
            if (!product) {
              console.log(`❌ Order item in order ${order.orderId} references invalid product`);
            }
          }
          
          // Check that order has a corresponding billing record
          const billing = await Billing.findOne({ orderId: order._id });
          if (!billing) {
            console.log(`❌ Order ${order.orderId} does not have a billing record`);
          }
        }
      }
    }
    
    // 5. Check that all products have valid categories
    console.log('\n- Validating product-category relationships...');
    const products = await Product.find();
    for (const product of products) {
      const category = await Category.findById(product.categoryId);
      if (!category) {
        console.log(`❌ Product ${product.name} has invalid category`);
      }
    }
    
    console.log('\n✅ Database relationship validation complete!');
    
  } catch (error) {
    console.error('Error validating database relationships:', error);
  }
}

// Run the improved seeding function and validation
async function runTestScenario() {
  await seedDatabase();
  await validateDatabaseRelationships();
}

// Execute the test scenario
runTestScenario();
