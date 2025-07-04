// Order Controller with support for direct address creation
const OrderService = require('../services/OrderService');
const AddressService = require('../services/AddressService');

class OrderController {
  // Create a new order with embedded address
  async createOrder(req, res) {
    try {
      const userId = req.user._id;
      const orderData = req.body;
      
      // Check if order data includes shipping address
      if (!orderData.shippingAddress) {
        return res.status(400).json({
          success: false,
          message: 'Shipping address is required'
        });
      }
      
      let addressId;
      
      // Create or find address from provided shipping address
      try {
        // Create a new address if one doesn't exist
        const addressData = {
          ...orderData.shippingAddress,
          userId
        };
        
        const address = await AddressService.createAddress(userId, addressData);
        addressId = address._id;
      } catch (addressError) {
        console.error('Error creating address:', addressError);
        return res.status(400).json({
          success: false,
          message: `Error with shipping address: ${addressError.message}`
        });
      }
      
      // Add addressId to order data
      orderData.addressId = addressId;
      
      const order = await OrderService.createOrder(userId, orderData);
      
      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order,
        orderCode: order.orderCode // Trả về orderCode cho client
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get all orders (admin)
  async getAllOrders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const orders = await OrderService.getAllOrders(filters);
      
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get user orders
  async getUserOrders(req, res) {
    try {
      const userId = req.user._id;
      const orders = await OrderService.getUserOrders(userId);
      
      return res.status(200).json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get order by ID
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.role === 'admin' ? null : req.user._id;
      
      const order = await OrderService.getOrderById(id, userId);
      
      return res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Update order status (admin)
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user._id;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      const order = await OrderService.updateOrderStatus(id, status, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Cancel order (user)
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const order = await OrderService.cancelOrder(id, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        order
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Generate order report (admin)
  async generateOrderReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
      
      const report = await OrderService.generateOrderReport(startDate, endDate);
      
      return res.status(200).json({
        success: true,
        report
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin-specific methods
  async getOrderStats(req, res) {
    try {
      const stats = await OrderService.getOrderStats();
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting order stats:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRecentOrders(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const orders = await OrderService.getRecentOrders(limit);
      
      return res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Error getting recent orders:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRevenueAnalytics(req, res) {
    try {
      const period = req.query.period || 'month';
      const analytics = await OrderService.getRevenueAnalytics(period);
      
      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async exportOrders(req, res) {
    try {
      const filters = req.query;
      const exportData = await OrderService.exportOrders(filters);
      
      return res.status(200).json({
        success: true,
        data: exportData,
        filename: `orders_export_${new Date().toISOString().split('T')[0]}.csv`
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new OrderController();
