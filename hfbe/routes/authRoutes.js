// Auth routes
const express = require('express');
const router = express.Router();
const passport = require('passport');
const AuthController = require('../controllers/AuthController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Register route
router.post('/register', AuthController.register);

// Login route
router.post('/login', AuthController.login);

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

// Update profile
router.put('/profile', isAuthenticated, AuthController.updateProfile);

// Change password
router.put('/change-password', isAuthenticated, AuthController.changePassword);

module.exports = router;
