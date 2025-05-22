// Cart controller
const CartService = require('../services/CartService');

class CartController {
  // Get user's cart
  async getCart(req, res) {
    try {
      const userId = req.user._id;
      const cart = await CartService.getOrCreateCart(userId);
      
      // Calculate total
      const cartTotal = await CartService.calculateCartTotal(cart.items);
      
      return res.status(200).json({
        success: true,
        cart: {
          _id: cart._id,
          cartId: cart.cartId,
          userId: cart.userId,
          items: cart.items,
          total: cartTotal
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Add item to cart
  async addToCart(req, res) {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.user._id;
      
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }
      
      const cart = await CartService.addToCart(userId, productId, quantity);
      
      // Calculate total
      const cartTotal = await CartService.calculateCartTotal(cart.items);
      
      return res.status(200).json({
        success: true,
        message: 'Item added to cart',
        cart: {
          _id: cart._id,
          cartId: cart.cartId,
          userId: cart.userId,
          items: cart.items,
          total: cartTotal
        }
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  
  // Update cart item quantity
  async updateCartItem(req, res) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user._id;
      
      if (!productId || !quantity) {
        return res.status(400).json({ success: false, message: 'Product ID and quantity are required' });
      }
      
      const cart = await CartService.updateCartItem(userId, productId, quantity);
      
      // Calculate total
      const cartTotal = await CartService.calculateCartTotal(cart.items);
      
      return res.status(200).json({
        success: true,
        message: 'Cart updated successfully',
        cart: {
          _id: cart._id,
          cartId: cart.cartId,
          userId: cart.userId,
          items: cart.items,
          total: cartTotal
        }
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  
  // Remove item from cart
  async removeFromCart(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user._id;
      
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }
      
      const cart = await CartService.removeFromCart(userId, productId);
      
      // Calculate total
      const cartTotal = await CartService.calculateCartTotal(cart.items);
      
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        cart: {
          _id: cart._id,
          cartId: cart.cartId,
          userId: cart.userId,
          items: cart.items,
          total: cartTotal
        }
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  
  // Clear cart
  async clearCart(req, res) {
    try {
      const userId = req.user._id;
      await CartService.clearCart(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CartController();
