// Wishlist routes
const express = require('express');
const router = express.Router();
const WishlistController = require('../controllers/WishlistController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// All wishlist routes require authentication
router.use(isAuthenticated);

// Get user's wishlist
router.get('/', WishlistController.getWishlist);

// Add item to wishlist
router.post('/add', WishlistController.addToWishlist);

// Remove item from wishlist
router.delete('/remove/:productId', WishlistController.removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:productId', WishlistController.checkWishlistItem);

// Clear wishlist
router.delete('/clear', WishlistController.clearWishlist);

module.exports = router;
