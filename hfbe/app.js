const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();  // Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/hanfoods",
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB with enhanced error handling
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/hanfoods";
console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);

// Create a database connection function to ensure models are registered after connection
const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI} with timeout settings...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout for server selection
      connectTimeoutMS: 15000, // 15 second timeout for initial connection
      socketTimeoutMS: 45000, // 45 second timeout on socket operations
      heartbeatFrequencyMS: 10000, // Check server status every 10 seconds
    });    console.log("Connected to MongoDB successfully");

    // Pre-load all models in correct order to prevent reference issues
    console.log("Pre-loading all models in correct dependency order...");
    try {
      // First load models without dependencies or with fewer dependencies
      const Account = require('./models/Account');
      const Category = require('./models/Category');
      console.log("Base models loaded");

      // Then load models that depend on the base models
      const Product = require('./models/Product');
      const Review = require('./models/Review');
      console.log("Product and Review models loaded");

      // Finally, load models that depend on other models
      const Cart = require('./models/Cart');
      const Order = require('./models/Order');
      const OrderItem = require('./models/OrderItem');
      const PaymentMethod = require('./models/PaymentMethod');
      const Wishlist = require('./models/Wishlist');
      const Address = require('./models/Address');
      const Discount = require('./models/Discount');
      const Billing = require('./models/Billing');
      console.log("All models successfully pre-loaded");
      
      // Test the connection by fetching a sample product
      const product = await Product.findOne();
      if (product) {
        console.log(`Database connection verified - found sample product: ${product.name}`);
      } else {
        console.log('Database connection successful but no products found');
      }
    } catch (modelError) {
      console.error("Error pre-loading models:", modelError);
      // Continue despite model errors - the controllers will handle appropriately
    }

    // Only initialize routes after successful database connection and model loading
    initializeRoutes();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      codeName: err.codeName,
      errInfo: err.errInfo
    });
    
    // Check if MongoDB is running
    console.log("Please ensure MongoDB is running at " + MONGO_URI.split('/')[2]);

    // In production, you might want the server to continue running with fallbacks
    // For development, it's often better to fail fast
    if (process.env.NODE_ENV !== 'production') {
      console.error('Exiting application due to database connection failure');
      process.exit(1); // Exit with error code
    }
    
    // Rethrow for the outer catch block
    throw err;
  }
};

// Passport configuration - moved inside initialization to ensure DB is connected first
const initializePassport = () => {
  const Account = require("./models/Account");
  const authenticate = require("./utils/authenticate");
  
  passport.use(Account.createStrategy());
  passport.serializeUser(Account.serializeUser());
  passport.deserializeUser(Account.deserializeUser());
  
  // Initialize JWT Strategy
  authenticate.jwtPassport;
};

// Initialize all routes after database connection
const initializeRoutes = () => {
  // Initialize passport first
  initializePassport();

  // Auth routes
  try {
    const authRoutes = require("./routes/authRoutes");
    app.use("/api/auth", authRoutes);
    console.log("Auth routes loaded successfully");
  } catch (error) {
    console.error("Error loading auth routes:", error.message);
  }

  // Product routes
  try {
    const productRoutes = require("./routes/productRoutes");
    app.use("/api/products", productRoutes);
    console.log("Product routes loaded successfully");
  } catch (error) {
    console.error("Error loading product routes:", error.message);
  }

  // Order routes
  try {
    const orderRoutes = require("./routes/orderRoutes");
    app.use("/api/orders", orderRoutes);
    console.log("Order routes loaded successfully");
  } catch (error) {
    console.error("Error loading order routes:", error.message);
  }

  // Billing routes
  try {
    const billingRoutes = require("./routes/billingRoutes");
    app.use("/api/billings", billingRoutes);
    console.log("Billing routes loaded successfully");
  } catch (error) {
    console.error("Error loading billing routes:", error.message);
  }

  // Discount routes
  // Health check routes
  try {
    const healthRoutes = require("./routes/healthRoutes");
    app.use("/api/health", healthRoutes);
    console.log("Health check routes loaded successfully");
  } catch (error) {
    console.error("Error loading health check routes:", error.message);
  }

  try {
    const discountRoutes = require("./routes/discountRoutes");
    app.use("/api/discounts", discountRoutes);
    console.log("Discount routes loaded successfully");
  } catch (error) {
    console.error("Error loading discount routes:", error.message);
  }

  // Cart routes
  try {
    const cartRoutes = require("./routes/cartRoutes");
    app.use("/api/carts", cartRoutes);
    console.log("Cart routes loaded successfully");
  } catch (error) {
    console.error("Error loading cart routes:", error.message);
  }

  // Address routes
  try {
    const addressRoutes = require("./routes/addressRoutes");
    app.use("/api/addresses", addressRoutes);
    console.log("Address routes loaded successfully");
  } catch (error) {
    console.error("Error loading address routes:", error.message);
  }

  // Payment routes
  try {
    const paymentRoutes = require("./routes/paymentRoutes");
    app.use("/api/payments", paymentRoutes);
    console.log("Payment routes loaded successfully");
  } catch (error) {
    console.error("Error loading payment routes:", error.message);
  }

  // Wishlist routes
  try {
    const wishlistRoutes = require("./routes/wishlistRoutes");
    app.use("/api/wishlists", wishlistRoutes);
    console.log("Wishlist routes loaded successfully");
  } catch (error) {
    console.error("Error loading wishlist routes:", error.message);
  }

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error caught in global handler:', err);
    console.error('Stack trace:', err.stack);

    // Send appropriate error response
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || "Something went wrong!",
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  });
  // Error handling middleware is now fully initialized
}

// Start server only after connecting to the database
const PORT = process.env.PORT || 5000;

// Start the connection process - this should be run only once at the module level
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to start server:", err);
  });