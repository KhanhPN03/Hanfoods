// Billing Service
const Billing = require('../models/Billing');
const Order = require('../models/Order');
const PaymentMethod = require('../models/PaymentMethod');
const { v4: uuidv4 } = require('uuid');

class BillingService {
  // Create a new billing record
  async createBilling(billingData, userId) {
    try {
      const { orderId, paymentMethodId, amount, status = 'pending', transactionId = '', addressId } = billingData;
      
      // Check if order exists
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Check if payment method exists
      const paymentMethod = await PaymentMethod.findById(paymentMethodId);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }
      
      // Generate billing ID
      const billingId = 'BILL-' + uuidv4().substring(0, 8).toUpperCase();
      
      // Create new billing record
      const newBilling = new Billing({
        billingId,
        orderId,
        paymentMethodId,
        addressId: addressId || (order && order.addressId),
        amount,
        status,
        transactionId,
        createdBy: userId
      });
      
      await newBilling.save();
      
      // If payment status is success, update order status
      if (status === 'success') {
        order.status = 'processing';
        await order.save();
      }
      
      return newBilling;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all billing records (admin)
  async getAllBillings(filters = {}) {
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
      
      const billings = await Billing.find(query)
        .populate('orderId')
        .populate('paymentMethodId')
        .sort({ createdAt: -1 });
        
      return billings;
    } catch (error) {
      throw error;
    }
  }
  
  // Get billing records for a user
  async getUserBillings(userId) {
    try {
      // Find orders for this user
      const userOrders = await Order.find({ userId });
      const orderIds = userOrders.map(order => order._id);
      
      // Find billings for these orders
      const billings = await Billing.find({
        orderId: { $in: orderIds },
        deleted: false
      })
        .populate('orderId')
        .populate('paymentMethodId')
        .sort({ createdAt: -1 });
        
      return billings;
    } catch (error) {
      throw error;
    }
  }
  
  // Get billing by ID
  async getBillingById(id) {
    try {
      const billing = await Billing.findById(id)
        .populate('orderId')
        .populate('paymentMethodId');
        
      if (!billing) {
        throw new Error('Billing record not found');
      }
      
      return billing;
    } catch (error) {
      throw error;
    }
  }
  
  // Update billing status
  async updateBillingStatus(id, status, userId) {
    try {
      const validStatuses = ['pending', 'success', 'failed'];
      
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid billing status');
      }
      
      const billing = await Billing.findById(id);
      
      if (!billing) {
        throw new Error('Billing record not found');
      }
      
      // Update status
      billing.status = status;
      await billing.save();
      
      // If payment is successful, update order status
      if (status === 'success') {
        const order = await Order.findById(billing.orderId);
        if (order) {
          order.status = 'processing';
          await order.save();
        }
      }
      
      return billing;
    } catch (error) {
      throw error;
    }
  }
  
  // Generate billing report (admin)
  async generateBillingReport(startDate, endDate) {
    try {
      const report = await Billing.aggregate([
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
          $lookup: {
            from: 'PaymentMethod',
            localField: 'paymentMethodId',
            foreignField: '_id',
            as: 'paymentMethod'
          }
        },
        {
          $unwind: '$paymentMethod'
        },
        {
          $group: {
            _id: {
              paymentMethod: '$paymentMethod.name',
              status: '$status'
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $sort: {
            '_id.paymentMethod': 1,
            '_id.status': 1
          }
        }
      ]);
      
      const totalTransactions = await Billing.countDocuments({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        },
        deleted: false
      });
      
      const totalRevenue = await Billing.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            },
            status: 'success',
            deleted: false
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      return {
        startDate,
        endDate,
        totalTransactions,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        paymentMethodBreakdown: report
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new BillingService();
