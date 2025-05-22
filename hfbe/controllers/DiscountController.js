// Discount Controller
const DiscountService = require('../services/DiscountService');

class DiscountController {
  // Create a new discount code (admin only)
  async createDiscount(req, res) {
    try {
      const userId = req.user._id;
      const discountData = req.body;
      
      // Validate required fields
      if (!discountData.code || !discountData.discountType || 
          !discountData.discountValue || !discountData.startDate || !discountData.endDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }
      
      const newDiscount = await DiscountService.createDiscount(discountData, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Discount code created successfully',
        discount: newDiscount
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get all discounts (admin only)
  async getAllDiscounts(req, res) {
    try {
      const discounts = await DiscountService.getAllDiscounts();
      
      return res.status(200).json({
        success: true,
        count: discounts.length,
        discounts
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Get discount by ID
  async getDiscountById(req, res) {
    try {
      const { id } = req.params;
      const discount = await DiscountService.getDiscountById(id);
      
      return res.status(200).json({
        success: true,
        discount
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Update discount (admin only)
  async updateDiscount(req, res) {
    try {
      const { id } = req.params;
      const discountData = req.body;
      
      const updatedDiscount = await DiscountService.updateDiscount(id, discountData);
      
      return res.status(200).json({
        success: true,
        message: 'Discount updated successfully',
        discount: updatedDiscount
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Delete discount (admin only)
  async deleteDiscount(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      await DiscountService.deleteDiscount(id, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Discount deleted successfully'
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Validate and apply discount code
  async applyDiscount(req, res) {
    try {
      const { code, orderAmount } = req.body;
      
      if (!code || !orderAmount) {
        return res.status(400).json({
          success: false,
          message: 'Discount code and order amount are required'
        });
      }
      
      const result = await DiscountService.applyDiscount(code, orderAmount);
      
      return res.status(200).json({
        success: true,
        discount: result.discount,
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  // Validate discount code without applying
  async validateDiscount(req, res) {
    try {
      const { code, orderAmount } = req.body;
      
      if (!code || !orderAmount) {
        return res.status(400).json({
          success: false,
          message: 'Discount code and order amount are required'
        });
      }
      
      const result = await DiscountService.validateDiscount(code, orderAmount);
      
      return res.status(200).json({
        success: true,
        isValid: true,
        discount: result.discount,
        discountAmount: result.discountAmount,
        finalPrice: result.finalPrice
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        isValid: false,
        message: error.message
      });
    }
  }
}

module.exports = new DiscountController();
