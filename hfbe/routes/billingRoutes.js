// Billing Routes
const express = require('express');
const router = express.Router();
const BillingController = require('../controllers/BillingController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Create a new billing record (admin only)
router.post('/', isAuthenticated, isAdmin, BillingController.createBilling);

// Get all billing records (admin only)
router.get('/admin', isAuthenticated, isAdmin, BillingController.getAllBillings);

// Get billing records for a user
router.get('/user', isAuthenticated, BillingController.getUserBillings);

// Get billing by ID
router.get('/:id', isAuthenticated, BillingController.getBillingById);

// Update billing status (admin only)
router.patch('/:id/status', isAuthenticated, isAdmin, BillingController.updateBillingStatus);

// Generate billing report (admin only)
router.get('/report', isAuthenticated, isAdmin, BillingController.generateBillingReport);

module.exports = router;
