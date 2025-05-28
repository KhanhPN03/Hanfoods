// Product routes
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);

// Admin routes
router.post('/', isAuthenticated, isAdmin, ProductController.createProduct);
router.put('/:id', isAuthenticated, isAdmin, ProductController.updateProduct);
router.delete('/:id', isAuthenticated, isAdmin, ProductController.deleteProduct);

// Admin dashboard routes
router.get('/admin/stats', isAuthenticated, isAdmin, ProductController.getProductStats);
router.get('/admin/top-products', isAuthenticated, isAdmin, ProductController.getTopProducts);
router.get('/admin/low-stock', isAuthenticated, isAdmin, ProductController.getLowStockProducts);
router.post('/admin/bulk-update', isAuthenticated, isAdmin, ProductController.bulkUpdateProducts);
router.get('/admin/export', isAuthenticated, isAdmin, ProductController.exportProducts);

module.exports = router;
