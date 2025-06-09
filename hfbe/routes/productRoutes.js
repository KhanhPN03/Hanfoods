// Product routes
const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');
const UploadController = require('../controllers/UploadController');

// Instantiate controllers
const productController = new ProductController();
const uploadController = new UploadController();

// Public routes
router.get('/', (req, res) => productController.getAllProducts(req, res));
router.get('/search', (req, res) => productController.searchProducts(req, res));
router.get('/:id', (req, res) => productController.getProductById(req, res));

// Admin routes
router.post('/', isAuthenticated, isAdmin, (req, res) => productController.createProduct(req, res));
// New route for creating products with image uploads - support thumbnailImage + images
router.post('/with-images', isAuthenticated, isAdmin, 
  uploadController.upload.fields([
    { name: 'thumbnailImage', maxCount: 1 },
    { name: 'images', maxCount: 10 }
  ]), 
  (req, res) => productController.createProductWithImages(req, res)
);
router.put('/:id', isAuthenticated, isAdmin, (req, res) => productController.updateProduct(req, res));
router.delete('/:id', isAuthenticated, isAdmin, (req, res) => productController.deleteProduct(req, res));
// Check if product has existing orders before deletion
router.get('/:id/orders/check', isAuthenticated, isAdmin, (req, res) => productController.checkProductOrders(req, res));

// Admin dashboard routes
router.get('/admin/stats', isAuthenticated, isAdmin, (req, res) => productController.getProductStats(req, res));
router.get('/admin/top-products', isAuthenticated, isAdmin, (req, res) => productController.getTopProducts(req, res));
router.get('/admin/low-stock', isAuthenticated, isAdmin, (req, res) => productController.getLowStockProducts(req, res));
router.post('/admin/bulk-update', isAuthenticated, isAdmin, (req, res) => productController.bulkUpdateProducts(req, res));
router.get('/admin/export', isAuthenticated, isAdmin, ProductController.exportProducts);

module.exports = router;
