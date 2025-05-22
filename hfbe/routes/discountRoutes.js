// Discount Routes
const express = require('express');
const router = express.Router();
const DiscountController = require('../controllers/DiscountController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Create a new discount code (admin only)
router.post('/', isAuthenticated, isAdmin, DiscountController.createDiscount);

// Get all discounts (admin only)
router.get('/', isAuthenticated, isAdmin, DiscountController.getAllDiscounts);

// Get discount by ID (admin only)
router.get('/:id', isAuthenticated, isAdmin, DiscountController.getDiscountById);

// Update discount (admin only)
router.patch('/:id', isAuthenticated, isAdmin, DiscountController.updateDiscount);

// Delete discount (admin only)
router.delete('/:id', isAuthenticated, isAdmin, DiscountController.deleteDiscount);

// Apply discount code
router.post('/apply', isAuthenticated, DiscountController.applyDiscount);

// Validate discount code
router.post('/validate', isAuthenticated, DiscountController.validateDiscount);

module.exports = router;
