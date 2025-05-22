// Order Routes
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Create a new order
router.post('/', isAuthenticated, OrderController.createOrder);

// Get all orders (admin only)
router.get('/admin', isAuthenticated, isAdmin, OrderController.getAllOrders);

// Get user orders
router.get('/user', isAuthenticated, OrderController.getUserOrders);

// Get order by ID
router.get('/:id', isAuthenticated, OrderController.getOrderById);

// Update order status (admin only)
router.patch('/:id/status', isAuthenticated, isAdmin, OrderController.updateOrderStatus);

// Cancel order (user)
router.patch('/:id/cancel', isAuthenticated, OrderController.cancelOrder);

// Generate order report (admin only)
router.get('/report', isAuthenticated, isAdmin, OrderController.generateOrderReport);

module.exports = router;
