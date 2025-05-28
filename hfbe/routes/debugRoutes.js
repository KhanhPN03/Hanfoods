const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Account = require('../models/Account');
const Product = require('../models/Product');

// Debug route to check all carts
router.get('/debug/carts', async (req, res) => {
  try {
    console.log('🔍 Debug: Checking all carts...');
    
    const carts = await Cart.find({}).populate({
      path: 'items.productId',
      select: 'name price salePrice stock thumbnailImage'
    });

    const accounts = await Account.countDocuments();
    const products = await Product.countDocuments();

    const debugInfo = {
      totalCarts: carts.length,
      totalAccounts: accounts,
      totalProducts: products,
      carts: carts.map(cart => ({
        cartId: cart.cartId,
        userId: cart.userId,
        itemsCount: cart.items.length,
        items: cart.items.map(item => ({
          productId: item.productId?._id,
          productName: item.productId?.name,
          quantity: item.quantity,
          price: item.productId?.price,
          salePrice: item.productId?.salePrice
        }))
      }))
    };

    console.log('📊 Debug info:', JSON.stringify(debugInfo, null, 2));

    res.json({
      success: true,
      debug: debugInfo
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
