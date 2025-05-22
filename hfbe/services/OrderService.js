// Order Service
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const DiscountService = require('./DiscountService');
const { v4: uuidv4 } = require('uuid');

class OrderService {
  // Create a new order
  async createOrder(userId, orderData) {
    try {
      const { addressId, discountCode } = orderData;
      
      // Get user's cart
      const cart = await Cart.findOne({ userId }).populate({
        path: 'items.productId',
        select: 'name price salePrice stock'
      });
      
      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty. Cannot create order.');
      }
      
      // Check product stock before proceeding
      for (const item of cart.items) {
        const product = await Product.findById(item.productId._id);
        
        if (!product) {
          throw new Error(`Product ${item.productId._id} not found`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }
      }
      
      // Calculate order total
      let totalAmount = 0;
      const orderItems = [];
      
      for (const item of cart.items) {
        const product = item.productId;
        const price = product.salePrice > 0 ? product.salePrice : product.price;
        
        totalAmount += price * item.quantity;
        
        orderItems.push({
          productId: product._id,
          name: product.name,
          price: price,
          quantity: item.quantity,
          subtotal: price * item.quantity
        });
      }
      
      // Apply discount if provided
      let discountAmount = 0;
      let discountId = null;
      
      if (discountCode) {
        try {
          const discountResult = await DiscountService.applyDiscount(discountCode, totalAmount);
          discountAmount = discountResult.discountAmount;
          discountId = discountResult.discount._id;
          totalAmount -= discountAmount;
        } catch (error) {
          // If discount is invalid, continue without applying discount
          console.error('Discount error:', error.message);
        }
      }
      
      // Generate order ID
      const orderId = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();
      
      // Create order
      const newOrder = new Order({
        orderId,
        userId,
        totalAmount,
        status: 'pending',
        addressId,
        items: orderItems,
        discountId,
        discountAmount,
        createdBy: userId
      });
      
      // Save the order
      const savedOrder = await newOrder.save();
      
      // Update product stock
      for (const item of cart.items) {
        await Product.findByIdAndUpdate(
          item.productId._id,
          { $inc: { stock: -item.quantity } }
        );
      }
      
      // Clear the cart after order is created
      cart.items = [];
      await cart.save();
      
      return savedOrder;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all orders (admin)
  async getAllOrders(filters = {}) {
    try {
      const { status, startDate, endDate } = filters;
      const query = { deleted: false };
      
      // Apply filters
      if (status) {
        query.status = status;
      }
      
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const orders = await Order.find(query)
        .populate('userId', 'username email')
        .populate('addressId')
        .sort({ createdAt: -1 });
        
      return orders;
    } catch (error) {
      throw error;
    }
  }
  
  // Get user orders
  async getUserOrders(userId) {
    try {
      const orders = await Order.find({ userId, deleted: false })
        .populate('addressId')
        .sort({ createdAt: -1 });
        
      return orders;
    } catch (error) {
      throw error;
    }
  }
  
  // Get order by ID
  async getOrderById(orderId, userId = null) {
    try {
      const query = { _id: orderId, deleted: false };
      
      // If userId provided, ensure order belongs to user
      if (userId) {
        query.userId = userId;
      }
      
      const order = await Order.findOne(query)
        .populate('userId', 'username email')
        .populate('addressId');
        
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
    } catch (error) {
      throw error;
    }
  }
  
  // Update order status (admin)
  async updateOrderStatus(orderId, status, userId) {
    try {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid order status');
      }
      
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Handle stock adjustment if order is cancelled
      if (status === 'cancelled' && order.status !== 'cancelled') {
        // Restore product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } }
          );
        }
      }
      
      order.status = status;
      await order.save();
      
      return order;
    } catch (error) {
      throw error;
    }
  }
  
  // Cancel order (user)
  async cancelOrder(orderId, userId) {
    try {
      const order = await Order.findOne({ _id: orderId, userId });
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Can only cancel if order is in pending or processing state
      if (!['pending', 'processing'].includes(order.status)) {
        throw new Error('Cannot cancel order in current status');
      }
      
      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: item.quantity } }
        );
      }
      
      order.status = 'cancelled';
      await order.save();
      
      return order;
    } catch (error) {
      throw error;
    }
  }
  
  // Generate order report (admin)
  async generateOrderReport(startDate, endDate) {
    try {
      const report = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            },
            deleted: false
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" }
          }
        }
      ]);
      
      const totalOrders = await Order.countDocuments({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        deleted: false
      });
      
      const totalRevenue = await Order.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            },
            status: { $in: ['processing', 'shipped', 'delivered'] },
            deleted: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" }
          }
        }
      ]);
      
      return {
        startDate,
        endDate,
        totalOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        statusBreakdown: report
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
