# Setup script for Han Foods E-commerce project (PowerShell version)
# This script will set up both backend and frontend with all necessary dependencies

# Function to print section headers
function Print-Header {
    param (
        [string]$Text
    )
    
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ""
}

# Function to check and create route files if they don't exist
function Create-RouteIfMissing {
    param (
        [string]$BaseDir,
        [string]$ControllerName,
        [string]$RouteName
    )
    
    $routeFile = Join-Path $BaseDir "routes\$($RouteName)Routes.js"
    
    if (-not (Test-Path $routeFile)) {
        Write-Host "Creating $RouteName routes file..." -ForegroundColor Yellow
        
        # Create basic route template
        $routeContent = @"
// ${RouteName} routes
const express = require('express');
const router = express.Router();
const ${ControllerName}Controller = require('../controllers/${ControllerName}Controller');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Get all ${RouteName}s
router.get('/', ${ControllerName}Controller.getAll${ControllerName}s);

// Get ${RouteName} by ID
router.get('/:id', ${ControllerName}Controller.get${ControllerName}ById);

// Create new ${RouteName} (authenticated)
router.post('/', isAuthenticated, ${ControllerName}Controller.create${ControllerName});

// Update ${RouteName} (authenticated)
router.put('/:id', isAuthenticated, ${ControllerName}Controller.update${RouteName});

// Delete ${RouteName} (admin only)
router.delete('/:id', isAuthenticated, isAdmin, ${ControllerName}Controller.delete${ControllerName});

module.exports = router;
"@
        
        # Create the file
        Set-Content -Path $routeFile -Value $routeContent
        
        Write-Host "Created $routeFile" -ForegroundColor Green
    }
}

# Main script starts here
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptDir

Print-Header "Han Foods E-commerce Setup"

# Backend setup
Print-Header "Setting up Backend"
Set-Location -Path (Join-Path $ScriptDir "hfbe")

# Install backend dependencies
Print-Header "Installing Backend Dependencies"
npm install --save bcryptjs connect-mongo cors dotenv express express-session jsonwebtoken `
  mongoose mongoose-delete morgan multer passport passport-google-oauth2 passport-jwt `
  passport-local passport-local-mongoose qrcode uuid

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Print-Header "Creating Environment File"
    
    $envContent = @"
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
"@
    
    Set-Content -Path ".env" -Value $envContent
    Write-Host ".env file created" -ForegroundColor Green
}

# Ensure routes directory exists
if (-not (Test-Path "routes")) {
    New-Item -Path "routes" -ItemType Directory
}

# Check and create missing route files
Print-Header "Verifying Route Files"
Create-RouteIfMissing "." "Auth" "auth"
Create-RouteIfMissing "." "Product" "product"
Create-RouteIfMissing "." "Order" "order"
Create-RouteIfMissing "." "Billing" "billing"
Create-RouteIfMissing "." "Discount" "discount"
Create-RouteIfMissing "." "Cart" "cart"
Create-RouteIfMissing "." "Address" "address"
Create-RouteIfMissing "." "Payment" "payment"
Create-RouteIfMissing "." "Wishlist" "wishlist"

# Return to root directory
Set-Location -Path $ScriptDir

# Frontend setup
Print-Header "Setting up Frontend"
Set-Location -Path (Join-Path $ScriptDir "hffe")

# Install frontend dependencies
Print-Header "Installing Frontend Dependencies"
npm install --save react react-dom react-router-dom axios react-toastify

# Return to root directory
Set-Location -Path $ScriptDir

Print-Header "Setup Complete!"
Write-Host "You can now start the application:" -ForegroundColor Green
Write-Host "  - Backend: cd hfbe && npm run dev" -ForegroundColor Yellow
Write-Host "  - Frontend: cd hffe && npm start" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: Update the .env file with real credentials before deploying to production." -ForegroundColor Red
