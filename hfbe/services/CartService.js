// Cart service
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { v4: uuidv4 } = require('uuid');

class CartService {  // Get or create a cart for a user
  async getOrCreateCart(userId) {
    try {
      // Loại bỏ .lean() để nhận được Mongoose document
      let cart = await Cart.findOne({ userId })
       .populate({
        path: "items.productId",
        select: "productId name price salePrice thumbnailImage stock description rating reviewCount materials dimensions", // Chỉ lấy các trường cần thiết
        populate: {
          path: "categoryId",
          select: "name", // Chỉ lấy tên category
        },
      });
      console.log(cart);
      
      
      if (!cart) {
        // Create a new cart if none exists
        const cartId = 'CART-' + uuidv4().substring(0, 8).toUpperCase();
        cart = new Cart({
          cartId,
          userId,
          items: [],
          createdBy: userId
        });
        await cart.save();
      }
      
      return cart;
    } catch (error) {
      throw error;
    }
  }
    // Add item to cart
  async addToCart(userId, productId, quantity) {
    try {
      // Đảm bảo quantity là một số nguyên dương
      const safeQuantity = Math.max(1, parseInt(quantity, 10) || 1);
      console.log("CartService - Adding to cart:", { userId, productId, originalQuantity: quantity, safeQuantity });

      // Check if product exists and has enough stock
      const product = await Product.findById(productId);
      console.log("product",product);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      if (product.stock < safeQuantity) {
        throw new Error('Not enough stock available');
      }
      
      // Get or create cart
      const cart = await this.getOrCreateCart(userId);
        // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId && item.productId._id && item.productId._id.toString() === productId.toString()
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const newQuantity = cart.items[existingItemIndex].quantity + safeQuantity;
        
        if (newQuantity > product.stock) {
          throw new Error('Cannot add more of this item due to stock limitations');
        }
        
        cart.items[existingItemIndex].quantity = newQuantity;
        console.log(`CartService - Updating quantity for existing item: ${cart.items[existingItemIndex].quantity}`);
      } else {
        // Add new item to cart
        cart.items.push({
          productId,
          quantity: safeQuantity
        });
        console.log(`CartService - Adding new item with quantity: ${safeQuantity}`);
      }
      
      await cart.save();
      
      // Return populated cart
      return await Cart.findById(cart._id).populate({
        path: 'items.productId',
        select: 'name price salePrice stock thumbnailImage images categoryId materials dimensions rating reviewCount description',
        populate: {
          path: 'categoryId',
          select: 'name',
          options: { strictPopulate: false }
        }
      });
    } catch (error) {
      throw error;
    }
  }
  
  // Update cart item quantity
  async updateCartItem(userId, productId, quantity) {
    try {
      if (quantity < 1) {
        throw new Error('Quantity must be greater than 0');
      }
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }
      if (product.stock < quantity) {
        throw new Error('Not enough stock available');
      }
      // Get or create cart (KHÔNG populate ở đây)
      const cart = await Cart.findOne({ userId });
      if (!cart) throw new Error('Cart not found');

      // So sánh productId chuẩn xác
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          (item.productId && item.productId.toString && item.productId.toString() === productId.toString())
      );
      if (existingItemIndex === -1) {
        // Nếu chưa có thì thêm mới
        cart.items.push({ productId, quantity });
      } else {
        // Update quantity
        cart.items[existingItemIndex].quantity = quantity;
      }
      await cart.save();
      // Return populated cart
      return await Cart.findById(cart._id).populate({
        path: 'items.productId',
        select: 'name price salePrice stock thumbnailImage images categoryId materials dimensions rating reviewCount description',
        populate: {
          path: 'categoryId',
          select: 'name',
          options: { strictPopulate: false }
        }
      });
    } catch (error) {
      throw error;
    }
  }
  
  // Remove item from cart
  async removeFromCart(userId, productId) {
    try {
      // Find user's cart
      const cart = await Cart.findOne({ userId });
      
      if (!cart) {
        throw new Error('Cart not found');
      }
      
      // Remove item from cart
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId.toString()
      );
      
      await cart.save();
      
      // Return populated cart
      return await Cart.findById(cart._id).populate({
        path: 'items.productId',
        select: 'name price salePrice stock thumbnailImage images categoryId materials dimensions rating reviewCount description',
        populate: {
          path: 'categoryId',
          select: 'name',
          options: { strictPopulate: false }
        }
      });
    } catch (error) {
      throw error;
    }
  }
  
  // Clear cart
  async clearCart(userId) {
    try {
      // Tìm cart, nếu không có thì tạo mới
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        const cartId = 'CART-' + uuidv4().substring(0, 8).toUpperCase();
        cart = new Cart({
          cartId,
          userId,
          items: [],
          createdBy: userId
        });
      } else {
        cart.items = [];
      }
      await cart.save();
      return cart;
    } catch (error) {
      throw error;
    }
  }
  
  // Calculate cart total
  async calculateCartTotal(cartItems) {
    try {
      let total = 0;
      
      for (const item of cartItems) {
        const product = item.productId;
        const price = product.salePrice > 0 ? product.salePrice : product.price;
        total += price * item.quantity;
      }
      
      return total;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CartService();
