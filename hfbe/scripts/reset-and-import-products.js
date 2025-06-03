/**
 * Script to clear all products and import new product data with Google image URLs
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize mongoose connection
const connectDB = async () => {  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Import models
const Product = require('../models/Product');
const Category = require('../models/Category');

// Sample category data
const sampleCategories = [
  { 
    name: 'Dụng Cụ Nhà Bếp', 
    description: 'Các sản phẩm dừa dùng trong nhà bếp', 
    slug: 'dung-cu-nha-bep',
    categoryId: 'CAT-KITCHEN'
  },
  { 
    name: 'Đồ Trang Trí', 
    description: 'Các sản phẩm dừa dùng để trang trí', 
    slug: 'do-trang-tri',
    categoryId: 'CAT-DECOR'
  },
  { 
    name: 'Vật Dụng Cá Nhân', 
    description: 'Các sản phẩm dừa dùng cá nhân', 
    slug: 'vat-dung-ca-nhan',
    categoryId: 'CAT-PERSONAL'
  },
  { 
    name: 'Quà Tặng', 
    description: 'Các sản phẩm dừa làm quà tặng', 
    slug: 'qua-tang',
    categoryId: 'CAT-GIFT'
  }
];

// Sample product data with Google image URLs
const sampleProducts = [
  {
    name: 'Cốc Dừa với Đĩa Lót',
    description: 'Được chế tác thủ công từ vỏ dừa tự nhiên, bộ cốc và đĩa lót này mang đến cảm giác tự nhiên, thân thiện với môi trường cho trải nghiệm uống cà phê hoặc trà của bạn. Mỗi cốc đều độc đáo với các vân gỗ và màu sắc tự nhiên khác nhau.',
    price: 189000,
    salePrice: 0,
    stock: 100,
    categoryName: 'Dụng Cụ Nhà Bếp',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-cup-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-cup-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-cup-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-cup-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-cup-4.jpg'
    ],
    rating: 5.0,
    reviewCount: 24,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 10cm, Chiều cao: 12cm'
  },
  {
    name: 'Ly Rượu Từ Dừa',
    description: 'Được chế tác thủ công từ vỏ dừa tự nhiên, ly rượu này mang đến cảm giác tự nhiên, thân thiện với môi trường cho trải nghiệm uống của bạn. Bề mặt được đánh bóng tạo cảm giác mềm mại khi cầm nắm.',
    price: 279000,
    salePrice: 229000,
    stock: 150,
    categoryName: 'Dụng Cụ Nhà Bếp',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-wine-cup-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-wine-cup-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-wine-cup-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-wine-cup-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-wine-cup-4.jpg'
    ],
    rating: 4.9,
    reviewCount: 32,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 8cm, Chiều cao: 10cm'
  },
  {
    name: 'Bộ Thìa Dừa',
    description: 'Bộ thìa được chế tác tinh xảo từ dừa này là sự bổ sung hoàn hảo thân thiện với môi trường cho căn bếp của bạn. Mỗi bộ gồm 4 chiếc thìa với kích thước khác nhau, phù hợp cho nhiều mục đích sử dụng.',
    price: 59000,
    salePrice: 39000,
    stock: 75,
    categoryName: 'Dụng Cụ Nhà Bếp',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-spoon-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-spoon-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-spoon-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-spoon-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-spoon-4.jpg'
    ],
    rating: 4.5,
    reviewCount: 14,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Chiều dài: 15cm'
  },
  {
    name: 'Đèn Bàn Từ Dừa',
    description: 'Đèn bàn làm từ vỏ dừa với điêu khắc thủ công, tạo ra hiệu ứng ánh sáng độc đáo và không gian đầm ấm cho gia đình bạn. Các hoa văn được chạm khắc tỉ mỉ, tạo nên những mảng sáng nghệ thuật khi bật đèn.',
    price: 329000,
    salePrice: 289000,
    stock: 50,
    categoryName: 'Đồ Trang Trí',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-lamp-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-lamp-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-lamp-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-lamp-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-lamp-4.jpg'
    ],
    rating: 4.8,
    reviewCount: 27,
    materials: 'Vỏ dừa tự nhiên, đèn LED',
    dimensions: 'Đường kính: 16cm, Chiều cao: 25cm'
  },
  {
    name: 'Vòng Tay Dừa Thiên Nhiên',
    description: 'Vòng tay được chế tác từ vỏ dừa tự nhiên, với các chi tiết khắc thủ công tinh xảo, một phụ kiện thời trang độc đáo và thân thiện với môi trường. Màu sắc tự nhiên của gỗ dừa mang đến vẻ đẹp mộc mạc và sang trọng.',
    price: 89000,
    salePrice: 0,
    stock: 200,
    categoryName: 'Vật Dụng Cá Nhân',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-bracelet-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-bracelet-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bracelet-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bracelet-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bracelet-4.jpg'
    ],
    rating: 4.7,
    reviewCount: 42,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 6-7cm'
  },
  {
    name: 'Túi Xách Dừa Thủ Công',
    description: 'Túi xách làm từ sợi dừa tự nhiên, được đan thủ công với độ bền cao, thiết kế hiện đại pha trộn với nét truyền thống. Túi có lớp lót bên trong và dây đeo có thể điều chỉnh độ dài.',
    price: 299000,
    salePrice: 259000,
    stock: 35,
    categoryName: 'Vật Dụng Cá Nhân',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-bag-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-bag-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bag-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bag-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bag-4.jpg'
    ],
    rating: 4.6,
    reviewCount: 19,
    materials: 'Sợi dừa tự nhiên, vải lót cotton',
    dimensions: 'Chiều rộng: 30cm, Chiều cao: 25cm'
  },
  {
    name: 'Bát Trang Trí Dừa',
    description: 'Bát trang trí được làm từ vỏ dừa, đánh bóng tự nhiên và điêu khắc thủ công, lý tưởng để trưng bày trái cây hoặc các đồ trang trí. Bề mặt bát được xử lý chống nước và dễ dàng vệ sinh.',
    price: 199000,
    salePrice: 0,
    stock: 60,
    categoryName: 'Đồ Trang Trí',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-bowl-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-bowl-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bowl-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bowl-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-bowl-4.jpg'
    ],
    rating: 4.9,
    reviewCount: 36,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 14-16cm, Chiều cao: 7-8cm'
  },
  {
    name: 'Hộp Trang Sức Dừa',
    description: 'Hộp trang sức tinh xảo được làm từ gỗ dừa với các họa tiết điêu khắc đẹp mắt, là món quà lý tưởng cho người thân yêu. Bên trong được lót nhung mềm mại bảo vệ đồ trang sức của bạn.',
    price: 259000,
    salePrice: 219000,
    stock: 40,
    categoryName: 'Quà Tặng',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-jewelry-box-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-jewelry-box-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-jewelry-box-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-jewelry-box-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-jewelry-box-4.jpg'
    ],
    rating: 4.8,
    reviewCount: 22,
    materials: 'Gỗ dừa tự nhiên, lót nhung',
    dimensions: 'Dài: 15cm, Rộng: 10cm, Cao: 6cm'
  },
  {
    name: 'Thớt Gỗ Dừa',
    description: 'Thớt gỗ dừa tự nhiên, chắc chắn và bền đẹp với thời gian. Bề mặt xử lý kháng khuẩn tự nhiên, an toàn cho việc chế biến thực phẩm. Thớt có thiết kế hai mặt, một mặt phẳng và một mặt có rãnh để hứng nước.',
    price: 149000,
    salePrice: 129000,
    stock: 85,
    categoryName: 'Dụng Cụ Nhà Bếp',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-cutting-board-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-cutting-board-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-cutting-board-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-cutting-board-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-cutting-board-4.jpg'
    ],
    rating: 4.7,
    reviewCount: 28,
    materials: 'Gỗ dừa tự nhiên',
    dimensions: 'Dài: 35cm, Rộng: 25cm, Dày: 2cm'
  },
  {
    name: 'Đồng Hồ Vỏ Dừa',
    description: 'Đồng hồ trang trí làm từ vỏ dừa với thiết kế độc đáo, kết hợp giữa nét truyền thống và hiện đại. Bộ máy đồng hồ chạy chính xác và bền bỉ, là món đồ trang trí ấn tượng cho không gian sống của bạn.',
    price: 389000,
    salePrice: 349000,
    stock: 30,
    categoryName: 'Đồ Trang Trí',
    thumbnailImage: 'https://storage.googleapis.com/coconature-products/coconut-clock-1.jpg',
    images: [
      'https://storage.googleapis.com/coconature-products/coconut-clock-1.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-clock-2.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-clock-3.jpg',
      'https://storage.googleapis.com/coconature-products/coconut-clock-4.jpg'
    ],
    rating: 4.8,
    reviewCount: 17,
    materials: 'Vỏ dừa tự nhiên, bộ máy đồng hồ chất lượng cao',
    dimensions: 'Đường kính: 25cm'
  }
];

// Function to clear all products
const clearAllProducts = async () => {
  try {
    console.log('🗑️ Deleting all existing products...');
    const result = await Product.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} products`);
  } catch (error) {
    console.error('❌ Error deleting products:', error);
    throw error;
  }
};

// Function to add sample categories if they don't exist
const addSampleCategories = async () => {
  try {
    console.log('📁 Adding sample categories...');
    
    for (const category of sampleCategories) {
      const existingCategory = await Category.findOne({ name: category.name });
        if (!existingCategory) {
        const newCategory = new Category({
          categoryId: category.categoryId,
          name: category.name,
          description: category.description,
          slug: category.slug
        });
        
        await newCategory.save();
        console.log(`✅ Added category: ${category.name}`);
      } else {
        console.log(`ℹ️ Category already exists: ${category.name}`);
      }
    }
    
    console.log('✅ Sample categories added successfully');
    return true;
  } catch (error) {
    console.error('❌ Error adding sample categories:', error);
    throw error;
  }
};

// Function to add sample products
const addSampleProducts = async () => {
  try {
    console.log('📦 Adding sample products...');
    
    for (const productData of sampleProducts) {
      // Find category ID
      const category = await Category.findOne({ name: productData.categoryName });
      
      if (!category) {
        console.error(`❌ Category not found: ${productData.categoryName}`);
        continue;
      }
      
      // Generate unique productId
      const productId = 'PROD-' + uuidv4().substring(0, 8).toUpperCase();
      
      const newProduct = new Product({
        productId,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        salePrice: productData.salePrice,
        stock: productData.stock,
        categoryId: category._id,
        thumbnailImage: productData.thumbnailImage,
        images: productData.images,
        rating: productData.rating,
        reviewCount: productData.reviewCount,
        materials: productData.materials,
        dimensions: productData.dimensions
      });
      
      await newProduct.save();
      console.log(`✅ Added product: ${productData.name}`);
    }
    
    console.log('✅ Sample products added successfully');
    return true;
  } catch (error) {
    console.error('❌ Error adding sample products:', error);
    throw error;
  }
};

// Function to verify the data
const verifyData = async () => {
  try {
    // Verify categories
    const categories = await Category.find();
    console.log(`📊 Found ${categories.length} categories in the database`);
    
    // Verify products
    const products = await Product.find().populate('categoryId');
    console.log(`📊 Found ${products.length} products in the database`);
    
    // Print a sample product
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log('📝 Sample Product:');
      console.log(`- Name: ${sampleProduct.name}`);
      console.log(`- Category: ${sampleProduct.categoryId.name}`);
      console.log(`- Price: ${sampleProduct.price}`);
      console.log(`- Thumbnail: ${sampleProduct.thumbnailImage}`);
      console.log(`- Images: ${sampleProduct.images.length} images`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verifying data:', error);
    throw error;
  }
};

// Main function to run script
const resetAndImportProducts = async () => {
  try {
    // Start time measurement
    const startTime = Date.now();
    
    console.log('🚀 Starting product reset and import process...');
    await connectDB();
    
    // Clear existing data
    await clearAllProducts();
    
    // Add new data
    await addSampleCategories();
    await addSampleProducts();
    
    // Verify imported data
    await verifyData();
    
    // End time measurement
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000;
    
    console.log(`✨ Process completed successfully in ${executionTime.toFixed(2)} seconds.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
};

// Run the script
resetAndImportProducts();
