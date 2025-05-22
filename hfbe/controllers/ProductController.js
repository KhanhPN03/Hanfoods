// Product controller
const ProductService = require('../services/ProductService');

class ProductController {
  // Get all products
  async getAllProducts(req, res) {
    try {
      // Log request for debugging
      console.log(`[ProductController] Getting products with query:`, req.query);
      
      const result = await ProductService.getAllProducts(req.query);
      
      console.log(`[ProductController] Found ${result.products.length} products`);
      
      return res.status(200).json({
        success: true,
        products: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      console.error(`[ProductController] Error in getAllProducts:`, error);
      // Send a more descriptive error message with stack trace in development
      const isDev = process.env.NODE_ENV !== 'production';
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        // Include stack trace only in development mode
        ...(isDev && { stack: error.stack })
      });
    }
  }
  // Get product by ID
  async getProductById(req, res) {
    try {
      const productId = req.params.id;
      console.log(`[ProductController] Getting product by ID: ${productId}`);
      
      // Optimize response time by setting a timeout for the database query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database query timeout')), 5000);
      });
      
      // Race the actual query with the timeout
      const product = await Promise.race([
        ProductService.getProductById(productId),
        timeoutPromise
      ]);
      
      console.log(`[ProductController] Product found: ${product._id}`);
      
      // Send immediate response with the product data
      return res.status(200).json({
        success: true,
        product
      });
    } catch (error) {
      console.error(`[ProductController] Error in getProductById:`, error);
      
      // If it's a "not found" error
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      } 
      // If it's a timeout error
      else if (error.message.includes('timeout')) {
        return res.status(504).json({ success: false, message: 'Request timed out while retrieving product data' });
      }
      
      // For other errors, return 500
      return res.status(500).json({ 
        success: false, 
        message: error.message,
        stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
      });
    }
  }
  // Create new product (admin only)
  async createProduct(req, res) {
    try {
      const { 
        name, 
        description, 
        price, 
        salePrice, 
        stock, 
        categoryId, 
        thumbnailImage,
        images
      } = req.body;
      
      // Validate required fields
      if (!name || !price || stock === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, price, and stock are required fields' 
        });
      }
      
      // Validate thumbnail image
      if (!thumbnailImage) {
        return res.status(400).json({
          success: false,
          message: 'Thumbnail image is required'
        });
      }
      
      // Validate images array (if provided)
      if (images && !Array.isArray(images)) {
        return res.status(400).json({
          success: false,
          message: 'Images must be an array of image URLs'
        });
      }
      
      const newProduct = await ProductService.createProduct(req.body, req.user._id);
      
      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        product: newProduct
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update product (admin only)
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const updatedProduct = await ProductService.updateProduct(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete product (admin only)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      await ProductService.deleteProduct(id);
      
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Search products
  async searchProducts(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ 
          success: false, 
          message: 'Search term is required' 
        });
      }
      
      const products = await ProductService.searchProducts(q);
      
      return res.status(200).json({
        success: true,
        products
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ProductController();
