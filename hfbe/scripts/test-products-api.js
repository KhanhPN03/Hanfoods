/**
 * Test script to verify products API is working
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/products';

async function testProductsAPI() {
  try {
    console.log('🔍 Testing products API...');
    
    // Get all products
    const response = await axios.get(`${API_URL}`);
    
    if (response.status === 200) {
      const products = response.data.products;
      
      console.log(`✅ API Response Status: ${response.status}`);
      console.log(`📊 Total products returned: ${products.length}`);
      
      // Display first product details as a sample
      if (products.length > 0) {
        const sample = products[0];
        console.log('\n📝 Sample Product from API:');
        console.log(`- Name: ${sample.name}`);
        console.log(`- Price: ${sample.price}`);
        console.log(`- Thumbnail: ${sample.thumbnailImage}`);
        console.log(`- Image Count: ${sample.images ? sample.images.length : 'N/A'}`);
        console.log(`- Rating: ${sample.rating}`);
        console.log(`- Reviews: ${sample.reviewCount}`);
      }
    } else {
      console.error(`❌ API Request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error testing products API:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testProductsAPI();
