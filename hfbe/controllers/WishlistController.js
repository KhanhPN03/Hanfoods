// Wishlist controller
const WishlistService = require('../services/WishlistService');

class WishlistController {
  // Get user's wishlist
  async getWishlist(req, res) {
    try {
      const userId = req.user._id;
      const wishlistData = await WishlistService.getUserWishlist(userId);
      
      return res.status(200).json({
        success: true,
        wishlistId: wishlistData.wishlistId,
        products: wishlistData.products
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Add item to wishlist
  async addToWishlist(req, res) {
    try {
      const { productId } = req.body;
      const userId = req.user._id;
      
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }
      
      const wishlistItem = await WishlistService.addToWishlist(userId, productId);
      
      return res.status(200).json({
        success: true,
        message: 'Item added to wishlist',
        item: wishlistItem
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  
  // Remove item from wishlist
  async removeFromWishlist(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user._id;
      
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }
      
      await WishlistService.removeFromWishlist(userId, productId);
      
      return res.status(200).json({
        success: true,
        message: 'Item removed from wishlist'
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
  
  // Check if item is in wishlist
  async checkWishlistItem(req, res) {
    try {
      const { productId } = req.params;
      const userId = req.user._id;
      
      if (!productId) {
        return res.status(400).json({ success: false, message: 'Product ID is required' });
      }
      
      const isInWishlist = await WishlistService.isInWishlist(userId, productId);
      
      return res.status(200).json({
        success: true,
        isInWishlist
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Clear wishlist
  async clearWishlist(req, res) {
    try {
      const userId = req.user._id;
      await WishlistService.clearWishlist(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Wishlist cleared successfully'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new WishlistController();
