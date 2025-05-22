@echo off
REM Setup script for Han Foods E-commerce project
REM This script will set up both backend and frontend with all necessary dependencies

echo.
echo ===============================================================
echo   Han Foods E-commerce Setup (Windows version)
echo ===============================================================
echo.

REM Navigate to the project directory
cd /d %~dp0

REM Backend setup
echo.
echo ===============================================================
echo   Setting up Backend
echo ===============================================================
echo.

cd hfbe || goto :error

REM Install backend dependencies
echo.
echo ===============================================================
echo   Installing Backend Dependencies
echo ===============================================================
echo.

call npm install --save bcryptjs connect-mongo cors dotenv express express-session jsonwebtoken ^
  mongoose mongoose-delete morgan multer passport passport-google-oauth2 passport-jwt ^
  passport-local passport-local-mongoose qrcode uuid

REM Create .env file if it doesn't exist
if not exist ".env" (
  echo.
  echo ===============================================================
  echo   Creating Environment File
  echo ===============================================================
  echo.
  
  (
    echo # Environment variables for Han Foods E-commerce backend
    echo PORT=5000
    echo NODE_ENV=development
    echo.
    echo # MongoDB connection string
    echo MONGO_URI=mongodb://localhost:27017/hanfoods
    echo.
    echo # Session and auth
    echo SESSION_SECRET=dev_session_secret_replace_in_production
    echo JWT_SECRET=dev_jwt_secret_replace_in_production
    echo.
    echo # Set these to actual Google OAuth credentials when needed
    echo # For now using placeholder values just to make the app start
    echo GOOGLE_CLIENT_ID=placeholder_client_id
    echo GOOGLE_CLIENT_SECRET=placeholder_client_secret
    echo.
    echo # Payment provider credentials (placeholders)
    echo VIETQR_ACCOUNT_NUMBER=0123456789
    echo VIETQR_ACCOUNT_NAME=Han Foods
    echo VIETQR_BANK_CODE=VNPAY
  ) > .env
  
  echo .env file created
)

REM Return to root directory
cd ..

REM Frontend setup
echo.
echo ===============================================================
echo   Setting up Frontend
echo ===============================================================
echo.

cd hffe || goto :error

REM Install frontend dependencies
echo.
echo ===============================================================
echo   Installing Frontend Dependencies
echo ===============================================================
echo.

call npm install --save react react-dom react-router-dom axios react-toastify

REM Return to root directory
cd ..

echo.
echo ===============================================================
echo   Setup Complete!
echo ===============================================================
echo.
echo You can now start the application:
echo   - Backend: cd hfbe ^&^& npm run dev
echo   - Frontend: cd hffe ^&^& npm start
echo.
echo IMPORTANT: Update the .env file with real credentials before deploying to production.
goto :eof

:error
echo An error occurred during setup.
exit /b %errorlevel%
