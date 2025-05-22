/**
 * Migration script to update existing products to the new schema
 * - Add thumbnailImage (from existing imageUrl)
 * - Add empty images array
 * - Add default values for new fields
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize mongoose connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Import models
const Product = require('../models/Product');
const Category = require('../models/Category');

// Sample category data
const sampleCategories = [
  { name: 'Dụng Cụ Nhà Bếp', description: 'Sản phẩm dừa cho nhà bếp' },
  { name: 'Đồ Trang Trí', description: 'Sản phẩm dừa trang trí' },
  { name: 'Vật Dụng Cá Nhân', description: 'Sản phẩm dừa cho cá nhân' },
  { name: 'Quà Tặng', description: 'Sản phẩm dừa làm quà tặng' }
];

// Sample product data
const sampleProducts = [
  {
    name: 'Cốc Dừa với Đĩa Lót',
    description: 'Được chế tác thủ công từ vỏ dừa tự nhiên, bộ cốc và đĩa lót này mang đến cảm giác tự nhiên, thân thiện với môi trường cho trải nghiệm uống cà phê hoặc trà của bạn.',
    price: 189000,
    salePrice: 0,
    stock: 100,
    categoryName: 'Dụng Cụ Nhà Bếp',
    thumbnailImage: 'https://i.etsystatic.com/14681201/r/il/cd2658/3140052285/il_794xN.3140052285_p2lc.jpg',
    images: [
      'https://i.etsystatic.com/14681201/r/il/cd2658/3140052285/il_794xN.3140052285_p2lc.jpg',
      'https://i.etsystatic.com/14681201/r/il/16df4e/3092336662/il_794xN.3092336662_7h5c.jpg',
      'https://i.etsystatic.com/14681201/r/il/387f7e/3092336266/il_794xN.3092336266_dhga.jpg',
      'https://i.etsystatic.com/14681201/r/il/33bde2/3140054229/il_794xN.3140054229_kcn6.jpg'
    ],
    rating: 5.0,
    reviewCount: 24,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 10cm, Chiều cao: 12cm'
  },
  {
    name: 'Ly Rượu Từ Dừa',
    description: 'Được chế tác thủ công từ vỏ dừa tự nhiên, ly rượu này mang đến cảm giác tự nhiên, thân thiện với môi trường cho trải nghiệm uống của bạn.',
    price: 279000,
    salePrice: 229000,
    stock: 150,
    categoryName: 'Dụng Cụ Nhà Bếp',
    thumbnailImage: 'https://i.etsystatic.com/32368552/r/il/c5db20/3990895556/il_794xN.3990895556_jlp1.jpg',
    images: [
      'https://i.etsystatic.com/32368552/r/il/c5db20/3990895556/il_794xN.3990895556_jlp1.jpg',
      'https://i.etsystatic.com/32368552/r/il/68300f/4038563279/il_794xN.4038563279_t7v0.jpg',
      'https://i.etsystatic.com/32368552/r/il/ef6543/4038563273/il_794xN.4038563273_r8wr.jpg',
      'https://i.etsystatic.com/32368552/r/il/0b113a/3990895608/il_794xN.3990895608_7ckn.jpg'
    ],
    rating: 4.9,
    reviewCount: 32,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 8cm, Chiều cao: 10cm'
  },
  {
    name: 'Bộ Thìa Dừa',
    description: 'Bộ thìa được chế tác tinh xảo từ dừa này là sự bổ sung hoàn hảo thân thiện với môi trường cho căn bếp của bạn.',
    price: 59000,
    salePrice: 39000,
    stock: 75,
    categoryName: 'Dụng Cụ Nhà Bếp',
    thumbnailImage: 'https://i.etsystatic.com/38963463/r/il/0bd016/4584623743/il_794xN.4584623743_368p.jpg',
    images: [
      'https://i.etsystatic.com/38963463/r/il/0bd016/4584623743/il_794xN.4584623743_368p.jpg',
      'https://i.etsystatic.com/38963463/r/il/e9d3de/4584623835/il_794xN.4584623835_n0uh.jpg',
      'https://i.etsystatic.com/38963463/r/il/ea004a/4536355874/il_794xN.4536355874_uzq6.jpg',
      'https://i.etsystatic.com/38963463/r/il/415674/4584623957/il_794xN.4584623957_hrqk.jpg'
    ],
    rating: 4.5,
    reviewCount: 14,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Chiều dài: 15cm'
  },
  {
    name: 'Đèn Bàn Từ Dừa',
    description: 'Đèn bàn làm từ vỏ dừa với điêu khắc thủ công, tạo ra hiệu ứng ánh sáng độc đáo và không gian đầm ấm cho gia đình bạn.',
    price: 329000,
    salePrice: 289000,
    stock: 50,
    categoryName: 'Đồ Trang Trí',
    thumbnailImage: 'https://i.etsystatic.com/42844233/r/il/46cf0e/4894280874/il_794xN.4894280874_2f9a.jpg',
    images: [
      'https://i.etsystatic.com/42844233/r/il/46cf0e/4894280874/il_794xN.4894280874_2f9a.jpg',
      'https://i.etsystatic.com/42844233/r/il/9bdf42/4894280844/il_794xN.4894280844_kqm0.jpg',
      'https://i.etsystatic.com/42844233/r/il/d2bfe4/4894280864/il_794xN.4894280864_7149.jpg',
      'https://i.etsystatic.com/42844233/r/il/f4a55a/4942872627/il_794xN.4942872627_g4mz.jpg'
    ],
    rating: 4.8,
    reviewCount: 27,
    materials: 'Vỏ dừa tự nhiên, đèn LED',
    dimensions: 'Đường kính: 16cm, Chiều cao: 25cm'
  },
  {
    name: 'Vòng Tay Dừa Thiên Nhiên',
    description: 'Vòng tay được chế tác từ vỏ dừa tự nhiên, với các chi tiết khắc thủ công tinh xảo, một phụ kiện thời trang độc đáo và thân thiện với môi trường.',
    price: 89000,
    salePrice: 0,
    stock: 200,
    categoryName: 'Vật Dụng Cá Nhân',
    thumbnailImage: 'https://i.etsystatic.com/6846852/r/il/dd77fd/2328961286/il_794xN.2328961286_q6un.jpg',
    images: [
      'https://i.etsystatic.com/6846852/r/il/dd77fd/2328961286/il_794xN.2328961286_q6un.jpg',
      'https://i.etsystatic.com/6846852/r/il/dd77fd/2328961286/il_794xN.2328961286_q6un.jpg',
      'https://i.etsystatic.com/6846852/r/il/6bd030/2281420399/il_794xN.2281420399_pxl9.jpg',
      'https://i.etsystatic.com/6846852/r/il/dd77fd/2328961286/il_794xN.2328961286_q6un.jpg'
    ],
    rating: 4.7,
    reviewCount: 42,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 6-7cm'
  },
  {
    name: 'Túi Xách Dừa Thủ Công',
    description: 'Túi xách làm từ sợi dừa tự nhiên, được đan thủ công với độ bền cao, thiết kế hiện đại pha trộn với nét truyền thống.',
    price: 299000,
    salePrice: 259000,
    stock: 35,
    categoryName: 'Vật Dụng Cá Nhân',
    thumbnailImage: 'https://i.etsystatic.com/37029406/r/il/7ae125/4737233431/il_794xN.4737233431_m381.jpg',
    images: [
      'https://i.etsystatic.com/37029406/r/il/7ae125/4737233431/il_794xN.4737233431_m381.jpg',
      'https://i.etsystatic.com/37029406/r/il/deda31/4737232555/il_794xN.4737232555_guq2.jpg',
      'https://i.etsystatic.com/37029406/r/il/22bd19/4689608226/il_794xN.4689608226_kyja.jpg',
      'https://i.etsystatic.com/37029406/r/il/4c3129/4737232067/il_794xN.4737232067_4yz5.jpg'
    ],
    rating: 4.6,
    reviewCount: 19,
    materials: 'Sợi dừa tự nhiên, vải lót cotton',
    dimensions: 'Chiều rộng: 30cm, Chiều cao: 25cm'
  },
  {
    name: 'Bát Trang Trí Dừa',
    description: 'Bát trang trí được làm từ vỏ dừa, đánh bóng tự nhiên và điêu khắc thủ công, lý tưởng để trưng bày trái cây hoặc các đồ trang trí.',
    price: 199000,
    salePrice: 0,
    stock: 60,
    categoryName: 'Đồ Trang Trí',
    thumbnailImage: 'https://i.etsystatic.com/32368552/r/il/94bb13/3943323870/il_794xN.3943323870_fx2u.jpg',
    images: [
      'https://i.etsystatic.com/32368552/r/il/94bb13/3943323870/il_794xN.3943323870_fx2u.jpg',
      'https://i.etsystatic.com/32368552/r/il/258129/3943321670/il_794xN.3943321670_hsum.jpg',
      'https://i.etsystatic.com/32368552/r/il/94bb13/3943323870/il_794xN.3943323870_fx2u.jpg',
      'https://i.etsystatic.com/32368552/r/il/258129/3943321670/il_794xN.3943321670_hsum.jpg'
    ],
    rating: 4.9,
    reviewCount: 36,
    materials: 'Vỏ dừa tự nhiên',
    dimensions: 'Đường kính: 14-16cm, Chiều cao: 7-8cm'
  },
  {
    name: 'Hộp Trang Sức Dừa',
    description: 'Hộp trang sức tinh xảo được làm từ gỗ dừa với các họa tiết điêu khắc đẹp mắt, là món quà lý tưởng cho người thân yêu.',
    price: 259000,
    salePrice: 219000,
    stock: 40,
    categoryName: 'Quà Tặng',
    thumbnailImage: 'https://i.etsystatic.com/28211072/r/il/372c8d/4576913568/il_794xN.4576913568_32ok.jpg',
    images: [
      'https://i.etsystatic.com/28211072/r/il/372c8d/4576913568/il_794xN.4576913568_32ok.jpg',
      'https://i.etsystatic.com/28211072/r/il/32422a/4529268193/il_794xN.4529268193_q0wv.jpg',
      'https://i.etsystatic.com/28211072/r/il/c9c264/4529268221/il_794xN.4529268221_h9kw.jpg',
      'https://i.etsystatic.com/28211072/r/il/e63de0/4576913540/il_794xN.4576913540_qm7q.jpg'
    ],
    rating: 4.8,
    reviewCount: 22,
    materials: 'Gỗ dừa tự nhiên',
    dimensions: 'Dài: 15cm, Rộng: 10cm, Cao: 6cm'
  }
];

// Function to migrate existing products
const migrateExistingProducts = async () => {
  try {
    console.log('Starting migration of existing products...');
    
    // Find all existing products
    const existingProducts = await Product.find({});
    console.log(`Found ${existingProducts.length} existing products`);
    
    // Update each product
    for (const product of existingProducts) {
      console.log(`Updating product: ${product.name}`);
      
      product.thumbnailImage = product.imageUrl || '';
      product.images = product.imageUrl ? [product.imageUrl] : [];
      product.rating = 4.5;
      product.reviewCount = Math.floor(Math.random() * 40) + 5;
      product.materials = 'Vỏ dừa tự nhiên';
      product.dimensions = 'Đường kính: 10cm, Chiều cao: 12cm';
      
      await product.save();
    }
    
    console.log('Existing products updated successfully');
  } catch (error) {
    console.error('Error updating existing products:', error);
  }
};

// Function to add sample categories
const addSampleCategories = async () => {
  try {
    console.log('Adding sample categories...');
    
    for (const category of sampleCategories) {
      const existingCategory = await Category.findOne({ name: category.name });
      
      if (!existingCategory) {
        const newCategory = new Category({
          name: category.name,
          description: category.description
        });
        
        await newCategory.save();
        console.log(`Added category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${category.name}`);
      }
    }
    
    console.log('Sample categories added successfully');
  } catch (error) {
    console.error('Error adding sample categories:', error);
  }
};

// Function to add sample products
const addSampleProducts = async () => {
  try {
    console.log('Adding sample products...');
    
    for (const productData of sampleProducts) {
      // Check if similar product already exists
      const existingProduct = await Product.findOne({ name: productData.name });
      
      if (existingProduct) {
        console.log(`Product already exists: ${productData.name}`);
        continue;
      }
      
      // Find category ID
      const category = await Category.findOne({ name: productData.categoryName });
      
      if (!category) {
        console.error(`Category not found: ${productData.categoryName}`);
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
      console.log(`Added product: ${productData.name}`);
    }
    
    console.log('Sample products added successfully');
  } catch (error) {
    console.error('Error adding sample products:', error);
  }
};

// Main function to run migration
const runMigration = async () => {
  try {
    await connectDB();
    await migrateExistingProducts();
    await addSampleCategories();
    await addSampleProducts();
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
