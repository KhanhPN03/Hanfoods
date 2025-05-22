# Setup script for Han Foods E-commerce project
# This script will set up both backend and frontend with all necessary dependencies

# Function to print section headers
print_header() {
  echo ""
  echo "======================================================="
  echo "  $1"
  echo "======================================================="
  echo ""
}

# Function to check and create route files if they don't exist
create_routes_if_missing() {
  local base_dir="$1"
  local controller_name="$2"
  local route_name="$3"
  local route_file="${base_dir}/routes/${route_name}Routes.js"
  
  if [ ! -f "$route_file" ]; then
    echo "Creating $route_name routes file..."
    
    # Create basic route template
    cat > "$route_file" << EOF
// ${route_name} routes
const express = require('express');
const router = express.Router();
const ${controller_name}Controller = require('../controllers/${controller_name}Controller');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Get all ${route_name}s
router.get('/', ${controller_name}Controller.getAll${controller_name}s);

// Get ${route_name} by ID
router.get('/:id', ${controller_name}Controller.get${controller_name}ById);

// Create new ${route_name} (authenticated)
router.post('/', isAuthenticated, ${controller_name}Controller.create${controller_name});

// Update ${route_name} (authenticated)
router.put('/:id', isAuthenticated, ${controller_name}Controller.update${controller_name});

// Delete ${route_name} (admin only)
router.delete('/:id', isAuthenticated, isAdmin, ${controller_name}Controller.delete${controller_name});

module.exports = router;
EOF
  
    echo "Created $route_file"
  fi
}

# Main script starts here
cd "$(dirname "$0")" || exit 1
print_header "Han Foods E-commerce Setup"

# Backend setup
print_header "Setting up Backend"
cd hfbe || exit 1

# Install backend dependencies
print_header "Installing Backend Dependencies"
npm install --save bcryptjs connect-mongo cors dotenv express express-session jsonwebtoken \
  mongoose mongoose-delete morgan multer passport passport-google-oauth2 passport-jwt \
  passport-local passport-local-mongoose qrcode uuid

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
  print_header "Creating Environment File"
  cat > .env << EOF
# Environment variables for Han Foods E-commerce backend
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
VIETQR_BANK_CODE=VNPAY
EOF
  echo ".env file created"
fi

# Ensure routes directory exists
mkdir -p routes

# Check and create missing route files
print_header "Verifying Route Files"
create_routes_if_missing "." "Auth" "auth"
create_routes_if_missing "." "Product" "product"
create_routes_if_missing "." "Order" "order"
create_routes_if_missing "." "Billing" "billing"
create_routes_if_missing "." "Discount" "discount"
create_routes_if_missing "." "Cart" "cart"
create_routes_if_missing "." "Address" "address"
create_routes_if_missing "." "Payment" "payment"
create_routes_if_missing "." "Wishlist" "wishlist"

# Return to root directory
cd ..

# Frontend setup
print_header "Setting up Frontend"
cd hffe || exit 1

# Install frontend dependencies
print_header "Installing Frontend Dependencies"
npm install --save react react-dom react-router-dom axios react-toastify

# Return to root directory
cd ..

print_header "Setup Complete!"
echo "You can now start the application:"
echo "  - Backend: cd hfbe && npm run dev"
echo "  - Frontend: cd hffe && npm start"
echo ""
echo "IMPORTANT: Update the .env file with real credentials before deploying to production."
