// Payment Service
const PaymentMethod = require('../models/PaymentMethod');
const Billing = require('../models/Billing');
const Order = require('../models/Order');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

class PaymentService {
  // Get all payment methods
  async getAllPaymentMethods() {
    try {
      const paymentMethods = await PaymentMethod.find({ deleted: false });
      return paymentMethods;
    } catch (error) {
      throw error;
    }
  }

  // Get payment method by ID
  async getPaymentMethodById(id) {
    try {
      const paymentMethod = await PaymentMethod.findById(id);
      if (!paymentMethod) {
        throw new Error('Payment method not found');
      }
      return paymentMethod;
    } catch (error) {
      throw error;
    }
  }

  // Create new payment method (admin only)
  async createPaymentMethod(paymentData, userId) {
    try {
      const { name, description } = paymentData;
      
      // Generate payment method ID
      const paymentMethodId = 'PM-' + uuidv4().substring(0, 8).toUpperCase();
      
      const newPaymentMethod = new PaymentMethod({
        paymentMethodId,
        name,
        description,
        createdBy: userId
      });
      
      await newPaymentMethod.save();
      return newPaymentMethod;
    } catch (error) {
      throw error;
    }
  }

  // Process cash on delivery payment
  async processCashOnDelivery(orderId, userId) {
    try {
      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Verify order belongs to user
      if (order.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized access to this order');
      }
      
      // Find the COD payment method
      const paymentMethod = await PaymentMethod.findOne({ name: 'Cash On Delivery' });
      if (!paymentMethod) {
        throw new Error('Cash On Delivery payment method not found');
      }
      
      // Generate billing ID
      const billingId = 'BILL-' + uuidv4().substring(0, 8).toUpperCase();
      
      // Create a new billing record
      const billing = new Billing({
        billingId,
        orderId: order._id,
        paymentMethodId: paymentMethod._id,
        amount: order.totalAmount,
        status: 'pending', // COD payments are pending until delivery
        transactionId: 'COD-' + uuidv4().substring(0, 8).toUpperCase(),
        createdBy: userId
      });
      
      await billing.save();
      
      // Update order status to processing
      order.status = 'processing';
      await order.save();
      
      return { order, billing };
    } catch (error) {
      throw error;
    }
  }

  // Process VietQR payment
  async processVietQR(orderId, userId) {
    try {
      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Verify order belongs to user
      if (order.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized access to this order');
      }
      
      // Find the VietQR payment method
      const paymentMethod = await PaymentMethod.findOne({ name: 'VietQR' });
      if (!paymentMethod) {
        throw new Error('VietQR payment method not found');
      }
      
      // Generate billing ID and transaction ID
      const billingId = 'BILL-' + uuidv4().substring(0, 8).toUpperCase();
      const transactionId = 'VQR-' + uuidv4().substring(0, 8).toUpperCase();
      
      // Create payment information for QR code
      const paymentInfo = {
        accountNumber: process.env.VIETQR_ACCOUNT_NUMBER || '0123456789',
        accountName: process.env.VIETQR_ACCOUNT_NAME || 'Han Foods',
        bankCode: process.env.VIETQR_BANK_CODE || 'VNPAY',
        amount: order.totalAmount,
        description: `Payment for Order ${order._id}`,
        transactionId
      };
      
      // Generate QR code content (simplified example)
      const qrContent = `${paymentInfo.bankCode}|${paymentInfo.accountNumber}|${paymentInfo.amount}|${paymentInfo.description}|${paymentInfo.transactionId}`;
      
      // Generate QR code as data URL
      const qrCodeImage = await QRCode.toDataURL(qrContent);
      
      // Create a new billing record
      const billing = new Billing({
        billingId,
        orderId: order._id,
        paymentMethodId: paymentMethod._id,
        amount: order.totalAmount,
        status: 'pending',
        transactionId,
        createdBy: userId
      });
      
      await billing.save();
      
      return { 
        order, 
        billing,
        qrCodeImage,
        paymentInfo
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify payment status (for admin or payment webhook)
  async verifyPayment(billingId, status) {
    try {
      const billing = await Billing.findOne({ billingId });
      if (!billing) {
        throw new Error('Billing record not found');
      }
      
      // Update billing status
      billing.status = status;
      await billing.save();
      
      // If payment successful, update order status
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
  
  // Get payment by order ID
  async getPaymentByOrderId(orderId) {
    try {
      const billing = await Billing.findOne({ orderId })
        .populate('paymentMethodId')
        .exec();
      
      if (!billing) {
        throw new Error('Payment record not found for this order');
      }
      
      return billing;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PaymentService();
