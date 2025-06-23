const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const orderController = require('../controllers/OrderController');
const productController = require('../controllers/ProductController');
const { authenticate, requireAdmin } = require('../middlewares/authMiddleware');

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// Dashboard routes
router.get('/dashboard/stats', (req, res) => adminController.getDashboardStats(req, res));
router.get('/dashboard/recent-orders', (req, res) => adminController.getRecentOrders(req, res));

// Revenue management routes
router.get('/revenue/stats', (req, res) => adminController.getRevenueStats(req, res));
router.get('/revenue/analytics', (req, res) => adminController.getRevenueAnalytics(req, res));
router.get('/revenue/detailed', (req, res) => adminController.getDetailedRevenue(req, res));
router.get('/revenue/export', (req, res) => adminController.exportRevenueReport(req, res));

// User management routes
router.get('/users', (req, res) => adminController.getAllUsers(req, res));
router.post('/users', (req, res) => adminController.createUser(req, res));
router.get('/users/stats', (req, res) => adminController.getUserStats(req, res));
router.get('/users/export', (req, res) => adminController.exportUsers(req, res));
router.get('/users/:id', (req, res) => adminController.getUserById(req, res));
router.get('/users/:id/orders/check', (req, res) => adminController.checkUserOrders(req, res));
router.patch('/users/:id/status', (req, res) => adminController.updateUserStatus(req, res));
router.patch('/users/:id/role', (req, res) => adminController.updateUserRole(req, res));
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));

// Order management routes
router.get('/orders', (req, res) => orderController.getAllOrders(req, res));
router.get('/orders/stats', (req, res) => orderController.getOrderStats(req, res));
router.patch('/orders/:id/status', (req, res) => orderController.updateOrderStatus(req, res));
router.get('/orders/:id', (req, res) => orderController.getOrderById(req, res));

// Product management routes  
router.get('/products/stats', (req, res) => productController.getProductStats(req, res));

// Settings management routes
router.get('/settings', (req, res) => adminController.getSettings(req, res));
router.put('/settings', (req, res) => adminController.updateSettings(req, res));

module.exports = router;
