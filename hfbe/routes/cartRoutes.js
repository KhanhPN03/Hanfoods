// Cart routes
const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// All cart routes require authentication
router.use(isAuthenticated);

// Get user's cart
router.get('/', CartController.getCart);

// Add item to cart
router.post('/add', CartController.addToCart);

// Update cart item quantity
router.put('/update', CartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', CartController.removeFromCart);

// Clear cart
router.delete('/clear', CartController.clearCart);

module.exports = router;
