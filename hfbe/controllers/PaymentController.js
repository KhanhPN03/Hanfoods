// Payment Controller
const PaymentService = require('../services/PaymentService');

class PaymentController {
  // Get all payment methods
  async getAllPaymentMethods(req, res) {
    try {
      const paymentMethods = await PaymentService.getAllPaymentMethods();
      
      return res.status(200).json({
        success: true,
        paymentMethods
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get payment method by ID
  async getPaymentMethodById(req, res) {
    try {
      const { id } = req.params;
      
      const paymentMethod = await PaymentService.getPaymentMethodById(id);
      
      return res.status(200).json({
        success: true,
        paymentMethod
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Create new payment method (admin only)
  async createPaymentMethod(req, res) {
    try {
      const userId = req.user._id;
      const paymentData = req.body;
      
      // Validate input
      if (!paymentData.name) {
        return res.status(400).json({
          success: false,
          message: 'Payment method name is required'
        });
      }
      
      const newPaymentMethod = await PaymentService.createPaymentMethod(paymentData, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Payment method created successfully',
        paymentMethod: newPaymentMethod
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Process cash on delivery payment
  async processCashOnDelivery(req, res) {
    try {
      const { orderId } = req.body;
      const userId = req.user._id;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }
      
      const result = await PaymentService.processCashOnDelivery(orderId, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Cash on delivery payment processed',
        order: result.order,
        billing: result.billing
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Process VietQR payment
  async processVietQR(req, res) {
    try {
      const { orderId } = req.body;
      const userId = req.user._id;
      
      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
      }
      
      const result = await PaymentService.processVietQR(orderId, userId);
      
      return res.status(200).json({
        success: true,
        message: 'VietQR payment initiated',
        order: result.order,
        billing: result.billing,
        qrCodeImage: result.qrCodeImage,
        paymentInfo: result.paymentInfo
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Verify payment status (webhook or admin)
  async verifyPayment(req, res) {
    try {
      const { billingId, status } = req.body;
      
      if (!billingId || !status) {
        return res.status(400).json({
          success: false,
          message: 'Billing ID and status are required'
        });
      }
      
      // Validate status
      if (!['pending', 'success', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, success, or failed'
        });
      }
      
      const billing = await PaymentService.verifyPayment(billingId, status);
      
      return res.status(200).json({
        success: true,
        message: `Payment status updated to ${status}`,
        billing
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get payment by order ID
  async getPaymentByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      
      const billing = await PaymentService.getPaymentByOrderId(orderId);
      
      return res.status(200).json({
        success: true,
        billing
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new PaymentController();
