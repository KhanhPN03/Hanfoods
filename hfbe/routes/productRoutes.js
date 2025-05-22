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

module.exports = router;
