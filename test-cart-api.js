// Test cart API directly
const axios = require('axios');

// Replace with a valid token from your browser's localStorage
const token = 'YOUR_TOKEN_HERE';

const API_BASE = 'http://localhost:5000/api';

const testCartAPI = async () => {
  try {
    console.log('🛒 Testing Cart API...');
    
    // Test get cart
    const cartResponse = await axios.get(`${API_BASE}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📦 Cart Response:', JSON.stringify(cartResponse.data, null, 2));
    console.log('📊 Cart Items Count:', cartResponse.data.cart?.items?.length || 0);
    
    if (cartResponse.data.cart?.items) {
      cartResponse.data.cart.items.forEach((item, index) => {
        console.log(`📋 Item ${index + 1}:`, {
          id: item.productId?._id,
          name: item.productId?.name,
          quantity: item.quantity,
          price: item.productId?.price,
          salePrice: item.productId?.salePrice
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Cart API Error:', error.response?.data || error.message);
  }
};

console.log('⚠️  Please update the token variable with a valid token from your browser');
console.log('🔧 Then run: node test-cart-api.js');

module.exports = { testCartAPI };
