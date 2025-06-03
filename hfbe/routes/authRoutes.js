// Auth routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const AuthController = require('../controllers/AuthController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window per IP
  message: {
    success: false,
    message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour per IP
  message: {
    success: false,
    message: 'Quá nhiều lần thử đăng ký. Vui lòng thử lại sau 1 giờ.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register route
router.post('/register', registerLimiter, AuthController.register);

// Login route
router.post('/login', authLimiter, AuthController.login);

// JWT protected route example
router.get('/protected', isAuthenticated, (req, res) => {
  res.json({ success: true, message: 'You accessed a protected route', user: req.user });
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  AuthController.googleCallback
);

// Get current user
router.get('/current-user', isAuthenticated, AuthController.getCurrentUser);

// Logout route
router.post('/logout', AuthController.logout);

// Refresh token route
router.post('/refresh-token', AuthController.refreshToken);

// Update profile
router.put('/profile', isAuthenticated, AuthController.updateProfile);

// Change password
router.put('/change-password', isAuthenticated, AuthController.changePassword);

module.exports = router;
