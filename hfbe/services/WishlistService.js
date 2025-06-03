// Wishlist service
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

class WishlistService {
  // Get user's wishlist items
  async getUserWishlist(userId) {
    try {
      // Find the user's wishlist or create one if it doesn't exist
      let wishlist = await Wishlist.findOne({ userId })
        .populate({
          path: 'productIds',
          select: 'name price salePrice thumbnailImage images stock rating reviewCount'
        });
      
      if (!wishlist) {
        wishlist = await this.createWishlist(userId);
        return { wishlistId: wishlist.wishlistId, products: [] };
      }
      
      return {
        wishlistId: wishlist.wishlistId,
        products: wishlist.productIds
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Create new wishlist
  async createWishlist(userId) {
    const wishlistId = 'WISH-' + uuidv4().substring(0, 8).toUpperCase();
    const wishlist = new Wishlist({
      wishlistId,
      userId,
      productIds: [],
      createdBy: userId
    });
    
    await wishlist.save();
    return wishlist;
  }
  
  // Add item to wishlist
  async addToWishlist(userId, productId) {
    try {
      // Check if product exists
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Find the user's wishlist or create one if it doesn't exist
      let wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        wishlist = await this.createWishlist(userId);
      }
      
      // Check if product is already in wishlist
      if (!wishlist.productIds.includes(productId)) {
        wishlist.productIds.push(productId);
        await wishlist.save();
      }
        // Return populated wishlist
      return await Wishlist.findById(wishlist._id).populate({
        path: 'productIds',
        select: 'name price salePrice thumbnailImage images stock rating reviewCount'
      });
    } catch (error) {
      throw error;
    }
  }
  
  // Remove item from wishlist
  async removeFromWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        throw new Error('Wishlist not found');
      }
      
      // Remove product from productIds array
      const initialLength = wishlist.productIds.length;
      wishlist.productIds = wishlist.productIds.filter(id => id.toString() !== productId);
      
      if (wishlist.productIds.length === initialLength) {
        throw new Error('Item not found in wishlist');
      }
      
      await wishlist.save();
      return wishlist;
    } catch (error) {
      throw error;
    }
  }
  
  // Check if item is in wishlist
  async isInWishlist(userId, productId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        return false;
      }
      
      return wishlist.productIds.some(id => id.toString() === productId);
    } catch (error) {
      throw error;
    }
  }
  
  // Clear wishlist
  async clearWishlist(userId) {
    try {
      const wishlist = await Wishlist.findOne({ userId });
      
      if (!wishlist) {
        throw new Error('Wishlist not found');
      }
      
      wishlist.productIds = [];
      await wishlist.save();
      return wishlist;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new WishlistService();
