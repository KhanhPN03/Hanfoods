// Payment Routes
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Get all payment methods
router.get('/', PaymentController.getAllPaymentMethods);

// Get payment method by ID
router.get('/:id', PaymentController.getPaymentMethodById);

// Create new payment method (admin only)
router.post('/', isAuthenticated, isAdmin, PaymentController.createPaymentMethod);

// Process cash on delivery payment
router.post('/cash-on-delivery', isAuthenticated, PaymentController.processCashOnDelivery);

// Process VietQR payment
router.post('/vietqr', isAuthenticated, PaymentController.processVietQR);

// Verify payment status (protected with secret key or admin access)
router.post('/verify', isAuthenticated, PaymentController.verifyPayment);

// Get payment by order ID
router.get('/order/:orderId', isAuthenticated, PaymentController.getPaymentByOrderId);

module.exports = router;
