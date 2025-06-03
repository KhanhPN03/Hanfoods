// Product service
const Product = require('../models/Product');
const Category = require('../models/Category'); // Explicitly require Category model before using it in populate
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Helper to check if MongoDB is connected
const checkDatabaseConnection = () => {
  const state = mongoose.connection.readyState;
  
  if (state !== 1) {
    const stateMessage = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[state] || 'unknown';
    
    throw new Error(`MongoDB is not connected (current state: ${stateMessage}). Please check your database connection.`);
  }
};

class ProductService {    async getAllProducts(query = {}) {
    console.log(`[ProductService] getAllProducts called at ${new Date().toISOString()}`);
    
    // Check database connection before attempting query
    try {
      checkDatabaseConnection();
      console.log('[ProductService] Database connection check passed');
    } catch (connError) {
      console.error('[ProductService] Connection check failed:', connError);
      throw connError;
    }
    
    try {
      console.log(`[ProductService] Getting products with query:`, query);
      
      const { categoryId, sortBy, order, limit = 10, page = 1 } = query;
      console.log('[ProductService] Parsed query parameters:', { categoryId, sortBy, order, limit, page });
      
      // Build filter object
      const filter = {};
      if (categoryId) filter.categoryId = categoryId;
      
      // Build sort object
      const sortOptions = {};
      if (sortBy) {
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;
      } else {
        sortOptions.createdAt = -1;  // Default sort by newest
      }
      
      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      console.log(`[ProductService] Executing find with filter:`, filter);
      console.log(`[ProductService] Sort options:`, sortOptions);
      console.log(`[ProductService] Skip: ${skip}, Limit: ${limit}`);
        // Query products with timeout
      const queryStart = Date.now();
      
      // Confirm Category model is available before populate
      if (!mongoose.models.Category) {
        console.log(`[ProductService] Category model not found, loading it explicitly`);
        // This should trigger the category model to load using our safe pattern
        require('../models/Category');
      }
      
      const products = await Promise.race([
        Product.find(filter)
          .sort(sortOptions)
          .skip(skip)
          .limit(parseInt(limit))
          // Only populate if we have the Category model
          .populate({
            path: 'categoryId',
            select: 'name',
            options: { strictPopulate: false } // Make population non-strict
          }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout after 5 seconds')), 5000)
        )
      ]);
      
      console.log(`[ProductService] Query executed in ${Date.now() - queryStart}ms`);
      
      // Get total count for pagination
      const totalCount = await Product.countDocuments(filter);
      
      console.log(`[ProductService] Found ${products.length} products out of ${totalCount} total`);
      
      return {
        products,
        pagination: {
          totalItems: totalCount,
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasNextPage: skip + products.length < totalCount,
          hasPrevPage: parseInt(page) > 1
        }
      };    } catch (error) {
      console.error(`[ProductService] Error in getAllProducts:`, error);
      
      // Check for specific known error types
      if (error.name === 'MongoNetworkError' || 
          error.message.includes('timeout') || 
          error.message.includes('ECONNREFUSED')) {
        throw new Error(`Database connection error: ${error.message}`);
      }
      
      // Check for model-related errors
      if (error.name === 'MissingSchemaError' || 
          error.message.includes('Schema hasn\'t been registered')) {
        console.error('[ProductService] Schema registration error detected');
        
        // List available models for diagnostic purposes
        try {
          console.log('[ProductService] Currently registered models:', 
            Object.keys(mongoose.models).join(', '));
            
          // Try to reload Category model as a last resort
          if (!mongoose.models.Category) {
            console.log('[ProductService] Attempting to load Category model');
            require('../models/Category');
            
            // Try to get products without category population
            console.log('[ProductService] Retrying query without category population');
            const simpleProducts = await Product.find(filter)
              .sort(sortOptions)
              .skip(skip)
              .limit(parseInt(limit));
              
            return {
              products: simpleProducts,
              pagination: {
                totalItems: await Product.countDocuments(filter),
                currentPage: parseInt(page),
                totalPages: Math.ceil(await Product.countDocuments(filter) / parseInt(limit)),
                hasNextPage: skip + simpleProducts.length < await Product.countDocuments(filter),
                hasPrevPage: parseInt(page) > 1
              },
              populationFailed: true // Flag to indicate category population failed
            };
          }
        } catch (modelError) {
          console.error('[ProductService] Failed to recover from schema error:', modelError);
        }
      }
      
      throw error;
    }
  }
  async getProductById(productId) {
    // Check database connection before attempting query
    try {
      checkDatabaseConnection();
    } catch (connError) {
      console.error('[ProductService] Connection check failed:', connError);
      throw connError;
    }
    
    try {
      console.log(`[ProductService] Getting product by ID: ${productId}`);
      
      // Add timeout to find query
      const queryStart = Date.now();
      const product = await Promise.race([
        Product.findById(productId).populate('categoryId', 'name'),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout after 5 seconds')), 5000)
        )
      ]);
      
      console.log(`[ProductService] Product query executed in ${Date.now() - queryStart}ms`);
      
      if (!product) {
        console.log(`[ProductService] Product with ID ${productId} not found`);
        throw new Error('Product not found');
      }
      
      console.log(`[ProductService] Found product: ${product.name}`);
      return product;
    } catch (error) {
      console.error(`[ProductService] Error in getProductById:`, error);
      
      // If this is an invalid ObjectId format
      if (error.name === 'CastError' && error.kind === 'ObjectId') {
        throw new Error(`Invalid product ID format: ${productId}`);
      }
      
      // Check if this is a connection error
      if (error.name === 'MongoNetworkError' || 
          error.message.includes('timeout') || 
          error.message.includes('ECONNREFUSED')) {
        throw new Error(`Database connection error: ${error.message}`);
      }
      
      throw error;
    }
  }
  
  async getProductsByIds(productIds) {
    try {
      return await Product.find({ _id: { $in: productIds } });
    } catch (error) {
      throw error;
    }
  }
    async createProduct(productData, userId) {
    try {
      // Generate unique productId
      const productId = 'PROD-' + uuidv4().substring(0, 8).toUpperCase();
      
      const newProduct = new Product({
        productId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        salePrice: productData.salePrice || 0,
        stock: productData.stock,
        categoryId: productData.categoryId,
        thumbnailImage: productData.thumbnailImage || '',
        images: productData.images || [],
        rating: productData.rating || 4.5,
        reviewCount: productData.reviewCount || 0,
        materials: productData.materials || '',
        dimensions: productData.dimensions || '',
        createdBy: userId
      });
      
      await newProduct.save();
      return newProduct;
    } catch (error) {
      throw error;
    }
  }
    async updateProduct(id, productData) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        {
          $set: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            salePrice: productData.salePrice,
            stock: productData.stock,
            categoryId: productData.categoryId,
            thumbnailImage: productData.thumbnailImage,
            images: productData.images,
            rating: productData.rating,
            reviewCount: productData.reviewCount,
            materials: productData.materials,
            dimensions: productData.dimensions
          }
        },
        { new: true }
      );
      
      if (!updatedProduct) {
        throw new Error('Product not found');
      }
      
      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }
  
  async deleteProduct(id) {
    try {
      const product = await Product.findByIdAndDelete(id);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return product;
    } catch (error) {
      throw error;
    }
  }
  
  async searchProducts(searchTerm) {
    try {
      const products = await Product.find({
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }).populate('categoryId', 'name');
      
      return products;
    } catch (error) {
      throw error;
    }
  }
  
  // Admin-specific service methods
  async getProductStats() {
    try {
      checkDatabaseConnection();
      
      const [
        totalProducts,
        totalCategories,
        lowStockCount,
        outOfStockCount,
        averagePrice,
        totalValue
      ] = await Promise.all([
        Product.countDocuments({ deleted: false }),
        Category.countDocuments({ deleted: false }),
        Product.countDocuments({ quantity: { $lte: 10, $gt: 0 }, deleted: false }),
        Product.countDocuments({ quantity: 0, deleted: false }),
        Product.aggregate([
          { $match: { deleted: false } },
          { $group: { _id: null, avgPrice: { $avg: '$price' } } }
        ]),
        Product.aggregate([
          { $match: { deleted: false } },
          { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$quantity'] } } } }
        ])
      ]);

      return {
        totalProducts,
        totalCategories,
        lowStockCount,
        outOfStockCount,
        averagePrice: averagePrice[0]?.avgPrice || 0,
        totalValue: totalValue[0]?.totalValue || 0
      };
    } catch (error) {
      throw error;
    }
  }

  async getTopProducts(limit = 10, sortBy = 'sales') {
    try {
      checkDatabaseConnection();
      
      let sortOptions = {};
      switch (sortBy) {
        case 'sales':
          sortOptions = { salesCount: -1 };
          break;
        case 'revenue':
          sortOptions = { revenue: -1 };
          break;
        case 'views':
          sortOptions = { viewCount: -1 };
          break;
        default:
          sortOptions = { salesCount: -1 };
      }

      const products = await Product.find({ deleted: false })
        .populate('categoryId', 'name')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .select('name price quantity salesCount revenue viewCount categoryId imageUrl');

      return products;
    } catch (error) {
      throw error;
    }
  }

  async getLowStockProducts(threshold = 10) {
    try {
      checkDatabaseConnection();
      
      const products = await Product.find({
        quantity: { $lte: threshold, $gt: 0 },
        deleted: false
      })
      .populate('categoryId', 'name')
      .sort({ quantity: 1 })
      .select('name price quantity categoryId imageUrl');

      return products;
    } catch (error) {
      throw error;
    }
  }

  async bulkUpdateProducts(productIds, updates) {
    try {
      checkDatabaseConnection();
      
      const result = await Product.updateMany(
        { _id: { $in: productIds }, deleted: false },
        { $set: updates },
        { runValidators: true }
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async exportProducts(filters = {}, format = 'csv') {
    try {
      checkDatabaseConnection();
      
      const query = { deleted: false, ...filters };
      const products = await Product.find(query)
        .populate('categoryId', 'name')
        .select('name description price quantity categoryId salesCount revenue imageUrl createdAt updatedAt');

      if (format === 'csv') {
        // Convert to CSV format
        const headers = ['ID', 'Name', 'Description', 'Price', 'Quantity', 'Category', 'Sales Count', 'Revenue', 'Image URL', 'Created At', 'Updated At'];
        const csvRows = [headers.join(',')];
        
        products.forEach(product => {
          const row = [
            product._id,
            `"${product.name}"`,
            `"${product.description || ''}"`,
            product.price,
            product.quantity,
            `"${product.categoryId?.name || ''}"`,
            product.salesCount || 0,
            product.revenue || 0,
            `"${product.imageUrl || ''}"`,
            product.createdAt?.toISOString() || '',
            product.updatedAt?.toISOString() || ''
          ];
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
      } else {
        // Return JSON format
        return JSON.stringify(products, null, 2);
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();
