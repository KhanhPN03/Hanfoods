/**
 * Node.js script to verify and fix the backend configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Constants
const BACKEND_DIR = path.join(__dirname, 'hfbe');
const ROUTES_DIR = path.join(BACKEND_DIR, 'routes');
const CONTROLLERS_DIR = path.join(BACKEND_DIR, 'controllers');
const SERVICES_DIR = path.join(BACKEND_DIR, 'services');

// Utility functions
const log = (message) => console.log(`\x1b[36m${message}\x1b[0m`);
const warn = (message) => console.log(`\x1b[33m${message}\x1b[0m`);
const error = (message) => console.log(`\x1b[31m${message}\x1b[0m`);
const success = (message) => console.log(`\x1b[32m${message}\x1b[0m`);

// Ensure directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Check if a file exists
const fileExists = (file) => fs.existsSync(file);

// Create routes templates
const createRouteTemplate = (name) => {
  const routeName = name.toLowerCase();
  const controllerName = name.charAt(0).toUpperCase() + name.slice(1);
  
  return `// ${controllerName} routes
const express = require('express');
const router = express.Router();
const ${controllerName}Controller = require('../controllers/${controllerName}Controller');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Get all ${routeName}s
router.get('/', ${controllerName}Controller.getAll${controllerName}s);

// Get ${routeName} by ID
router.get('/:id', ${controllerName}Controller.get${controllerName}ById);

// Create new ${routeName} (authenticated)
router.post('/', isAuthenticated, ${controllerName}Controller.create${controllerName});

// Update ${routeName} (authenticated)
router.put('/:id', isAuthenticated, ${controllerName}Controller.update${routeName});

// Delete ${routeName} (admin only)
router.delete('/:id', isAuthenticated, isAdmin, ${controllerName}Controller.delete${controllerName});

module.exports = router;`;
};

// Main function
async function main() {
  log('====================================');
  log('  Backend Verification & Fix Script');
  log('====================================');
  
  // Check directory structure
  ensureDir(BACKEND_DIR);
  ensureDir(ROUTES_DIR);
  ensureDir(CONTROLLERS_DIR);
  ensureDir(SERVICES_DIR);
  
  // Define routes to check
  const routes = [
    { name: 'auth', filename: 'authRoutes.js' },
    { name: 'product', filename: 'productRoutes.js' },
    { name: 'order', filename: 'orderRoutes.js' },
    { name: 'billing', filename: 'billingRoutes.js' },
    { name: 'discount', filename: 'discountRoutes.js' },
    { name: 'cart', filename: 'cartRoutes.js' },
    { name: 'address', filename: 'addressRoutes.js' },
    { name: 'payment', filename: 'paymentRoutes.js' },
    { name: 'wishlist', filename: 'wishlistRoutes.js' }
  ];
  
  // Check and create missing routes
  log('\nChecking route files...');
  for (const route of routes) {
    const routeFile = path.join(ROUTES_DIR, route.filename);
    if (!fileExists(routeFile)) {
      warn(`Missing route file: ${route.filename}, creating...`);
      fs.writeFileSync(routeFile, createRouteTemplate(route.name));
      success(`Created ${route.filename}`);
    } else {
      success(`✓ ${route.filename} exists`);
    }
  }
  
  // Check .env file
  const envFile = path.join(BACKEND_DIR, '.env');
  if (!fileExists(envFile)) {
    warn('\n.env file missing, creating default...');
    const envContent = `# Environment variables for Han Foods E-commerce backend
PORT=5000
NODE_ENV=development

# MongoDB connection string
MONGO_URI=mongodb://localhost:27017/hanfoods

# Session and auth
SESSION_SECRET=dev_session_secret_replace_in_production
JWT_SECRET=dev_jwt_secret_replace_in_production

# Set these to actual Google OAuth credentials when needed
# For now using placeholder values just to make the app start
GOOGLE_CLIENT_ID=placeholder_client_id
GOOGLE_CLIENT_SECRET=placeholder_client_secret

# Payment provider credentials (placeholders)
VIETQR_ACCOUNT_NUMBER=0123456789
VIETQR_ACCOUNT_NAME=Han Foods
VIETQR_BANK_CODE=VNPAY`;
    
    fs.writeFileSync(envFile, envContent);
    success('Created .env file with default settings');
  } else {
    success('\n✓ .env file exists');
  }
  
  // Check package.json and add scripts if needed
  const packageFile = path.join(BACKEND_DIR, 'package.json');
  if (fileExists(packageFile)) {
    log('\nChecking package.json scripts...');
    let packageJson = JSON.parse(fs.readFileSync(packageFile));
    
    if (!packageJson.scripts || !packageJson.scripts.dev) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.start = "node app.js";
      packageJson.scripts.dev = "nodemon app.js";
      
      fs.writeFileSync(packageFile, JSON.stringify(packageJson, null, 2));
      success('Added "dev" script to package.json');
    } else {
      success('✓ package.json scripts are properly configured');
    }
  }
  
  // Install required dependencies
  try {
    log('\nInstalling required dependencies...');
    execSync('npm install --save bcryptjs connect-mongo cors dotenv express express-session jsonwebtoken mongoose mongoose-delete morgan multer passport passport-google-oauth2 passport-jwt passport-local passport-local-mongoose qrcode uuid', {
      cwd: BACKEND_DIR,
      stdio: 'inherit'
    });
    success('Successfully installed required dependencies');
  } catch (err) {
    error('Failed to install dependencies. Please run npm install manually in the hfbe directory.');
  }
  
  // Check if AuthService.js has fallback for Google OAuth
  const authServiceFile = path.join(SERVICES_DIR, 'AuthService.js');
  if (fileExists(authServiceFile)) {
    log('\nChecking AuthService.js...');
    let authServiceContent = fs.readFileSync(authServiceFile, 'utf8');
    
    if (!authServiceContent.includes('if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)')) {
      log('Adding fallback for Google OAuth initialization...');
      authServiceContent = authServiceContent.replace(
        'initializeGoogleStrategy() {',
        `initializeGoogleStrategy() {
    // Only initialize if environment variables are available
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn('Google OAuth credentials not found in environment variables. Google authentication will not work.');
      return; // Skip initialization if credentials are missing
    }`
      );
      
      fs.writeFileSync(authServiceFile, authServiceContent);
      success('Updated AuthService.js with OAuth fallback');
    } else {
      success('✓ AuthService.js has proper OAuth fallback');
    }
  }
  
  log('\n====================================');
  success('Backend verification and fixes complete!');
  log('You can now start the backend with:');
  log('  cd hfbe && npm run dev');
  log('====================================');
}

main().catch(err => {
  error(`An error occurred: ${err.message}`);
  process.exit(1);
});
