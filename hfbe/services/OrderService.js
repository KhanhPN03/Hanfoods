// Order Service with support for checkout process from frontend
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const DiscountService = require('./DiscountService');
const AddressService = require('./AddressService');
const { v4: uuidv4 } = require('uuid');

class OrderService {
  // Create a new order with items directly from frontend
  async createOrder(userId, orderData) {
    try {
      const { items, shippingAddress, paymentMethod, status = 'pending', subtotal, shippingFee = 0, discount = 0, total, discountCode } = orderData;
      
      if (!items || !items.length) {
        throw new Error('Order must contain at least one item');
      }
      
      // Handle address - create or find an existing one
      let addressId;
      if (orderData.addressId) {
        // Use provided addressId
        addressId = orderData.addressId;
      } else if (shippingAddress) {
        // Create or find address from shippingAddress
        const address = await AddressService.findOrCreateAddress(userId, shippingAddress);
        addressId = address._id;
      } else {
        throw new Error('Shipping address is required');
      }
      
      // Check product stock before proceeding
      for (const item of items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name || 'product'}`);
        }
      }
      
      // Calculate order total if not provided
      let totalAmount = total;
      if (!totalAmount) {
        totalAmount = subtotal + shippingFee - discount;
      }
      
      // Map items to order format
      const orderItems = [];
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        
        const price = item.price || (product.salePrice > 0 ? product.salePrice : product.price);
        
        orderItems.push({
          productId: product._id,
          name: product.name,
          price: price,
          quantity: item.quantity,
          subtotal: price * item.quantity
        });
      }
      
      // Apply discount if provided
      let discountAmount = discount;
      let discountId = null;
      
      if (discountCode && !discountAmount) {
        try {
          const discountResult = await DiscountService.applyDiscount(discountCode, subtotal);
          discountAmount = discountResult.discountAmount;
          discountId = discountResult.discount._id;
          totalAmount -= discountAmount;
        } catch (error) {
          // If discount is invalid, continue without applying discount
          console.error('Discount error:', error.message);
        }
      }
        // Generate order ID and order code
      const orderId = 'ORD-' + uuidv4().substring(0, 8).toUpperCase();
      const orderCode = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      // Create order
      const newOrder = new Order({
        orderId,
        orderCode,
        userId,
        email: orderData.email,
        totalAmount,
        status: status || 'pending',
        addressId,
        items: orderItems,
        discountId,
        discountAmount,
        paymentMethod,
        isPaid: status === 'paid',
        paidAt: status === 'paid' ? new Date() : null,
        shippingFee,
        createdBy: userId
      });
      
      // Save the order
      const savedOrder = await newOrder.save();
      
      // Update product stock
      for (const item of items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );
      }
      
      // Clear the user's cart if order is created
      try {
        const cart = await Cart.findOne({ userId });
        if (cart) {
          cart.items = [];
          await cart.save();
        }
      } catch (cartError) {
        console.error('Error clearing cart:', cartError);
        // Don't fail the order if cart clearing fails
      }
      
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
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'paid'];
      
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
      
      // Update payment status if needed
      if (status === 'paid' && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
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
            status: { $in: ['processing', 'shipped', 'delivered', 'paid'] },
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

  // Admin-specific methods
  async getOrderStats() {
    try {
      const totalOrders = await Order.countDocuments({ deleted: false });
      const pendingOrders = await Order.countDocuments({ status: 'pending', deleted: false });
      const processingOrders = await Order.countDocuments({ status: 'processing', deleted: false });
      const shippedOrders = await Order.countDocuments({ status: 'shipped', deleted: false });
      const deliveredOrders = await Order.countDocuments({ status: 'delivered', deleted: false });
      const cancelledOrders = await Order.countDocuments({ status: 'cancelled', deleted: false });

      // Get monthly revenue for the last 12 months
      const monthlyRevenue = await Order.aggregate([
        {
          $match: {
            status: { $in: ['processing', 'shipped', 'delivered', 'paid'] },
            deleted: false,
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            revenue: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      // Get total revenue
      const totalRevenue = await Order.aggregate([
        {
          $match: {
            status: { $in: ['processing', 'shipped', 'delivered', 'paid'] },
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
        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        monthlyRevenue
      };
    } catch (error) {
      throw error;
    }
  }

  async getRecentOrders(limit = 10) {
    try {
      const orders = await Order.find({ deleted: false })
        .populate('userId', 'username email')
        .populate('addressId')
        .sort({ createdAt: -1 })
        .limit(limit);

      return orders;
    } catch (error) {
      throw error;
    }
  }

  async getRevenueAnalytics(period = 'month') {
    try {
      let matchCondition = {
        status: { $in: ['processing', 'shipped', 'delivered', 'paid'] },
        deleted: false
      };

      let groupBy;
      let dateRange;

      switch (period) {
        case 'week':
          dateRange = new Date(new Date().setDate(new Date().getDate() - 7));
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          };
          break;
        case 'year':
          dateRange = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          };
          break;
        default: // month
          dateRange = new Date(new Date().setMonth(new Date().getMonth() - 1));
          groupBy = {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          };
      }

      matchCondition.createdAt = { $gte: dateRange };

      const analytics = await Order.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: groupBy,
            revenue: { $sum: "$totalAmount" },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: "$totalAmount" }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
        }
      ]);

      // Get comparison data for previous period
      const prevDateRange = new Date();
      switch (period) {
        case 'week':
          prevDateRange.setDate(prevDateRange.getDate() - 14);
          break;
        case 'year':
          prevDateRange.setFullYear(prevDateRange.getFullYear() - 2);
          break;
        default:
          prevDateRange.setMonth(prevDateRange.getMonth() - 2);
      }

      const prevPeriodRevenue = await Order.aggregate([
        {
          $match: {
            ...matchCondition,
            createdAt: {
              $gte: prevDateRange,
              $lt: dateRange
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        }
      ]);

      const currentPeriodRevenue = await Order.aggregate([
        {
          $match: matchCondition
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalAmount" },
            count: { $sum: 1 }
          }
        }
      ]);

      const prevRevenue = prevPeriodRevenue.length > 0 ? prevPeriodRevenue[0].total : 0;
      const currentRevenue = currentPeriodRevenue.length > 0 ? currentPeriodRevenue[0].total : 0;
      const growthPercentage = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

      return {
        period,
        analytics,
        summary: {
          currentRevenue,
          previousRevenue: prevRevenue,
          growthPercentage,
          currentOrderCount: currentPeriodRevenue.length > 0 ? currentPeriodRevenue[0].count : 0,
          previousOrderCount: prevPeriodRevenue.length > 0 ? prevPeriodRevenue[0].count : 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async exportOrders(filters = {}) {
    try {
      let query = { deleted: false };

      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      if (filters.startDate && filters.endDate) {
        query.createdAt = {
          $gte: new Date(filters.startDate),
          $lte: new Date(filters.endDate)
        };
      }
      if (filters.minAmount) {
        query.totalAmount = { $gte: parseFloat(filters.minAmount) };
      }
      if (filters.maxAmount) {
        if (query.totalAmount) {
          query.totalAmount.$lte = parseFloat(filters.maxAmount);
        } else {
          query.totalAmount = { $lte: parseFloat(filters.maxAmount) };
        }
      }

      const orders = await Order.find(query)
        .populate('userId', 'username email phone')
        .populate('addressId')
        .sort({ createdAt: -1 });

      // Format data for export
      const exportData = orders.map(order => ({
        orderCode: order.orderCode,
        customerName: order.userId?.username || 'N/A',
        customerEmail: order.userId?.email || 'N/A',
        customerPhone: order.userId?.phone || 'N/A',
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        totalAmount: order.totalAmount,
        itemCount: order.items?.length || 0,
        shippingAddress: order.addressId ? 
          `${order.addressId.street}, ${order.addressId.city}, ${order.addressId.state}, ${order.addressId.country}` : 'N/A',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));

      return exportData;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderService();
