// Billing Controller
const BillingService = require('../services/BillingService');

class BillingController {
  // Create a new billing record
  async createBilling(req, res) {
    try {
      const userId = req.user._id;
      const billingData = req.body;
      
      // Validate required fields
      if (!billingData.orderId || !billingData.paymentMethodId || !billingData.amount) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      const billing = await BillingService.createBilling(billingData, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Billing record created successfully',
        billing
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get all billing records (admin)
  async getAllBillings(req, res) {
    try {
      const filters = {
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };
      
      const billings = await BillingService.getAllBillings(filters);
      
      return res.status(200).json({
        success: true,
        count: billings.length,
        billings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get billing records for a user
  async getUserBillings(req, res) {
    try {
      const userId = req.user._id;
      const billings = await BillingService.getUserBillings(userId);
      
      return res.status(200).json({
        success: true,
        count: billings.length,
        billings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get billing by ID
  async getBillingById(req, res) {
    try {
      const { id } = req.params;
      const billing = await BillingService.getBillingById(id);
      
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
  
  // Update billing status (admin)
  async updateBillingStatus(req, res) {
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
      
      const billing = await BillingService.updateBillingStatus(id, status, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Billing status updated successfully',
        billing
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Generate billing report (admin)
  async generateBillingReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }
      
      const report = await BillingService.generateBillingReport(startDate, endDate);
      
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
}

module.exports = new BillingController();
