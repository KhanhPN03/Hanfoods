// Discount Service
const Discount = require('../models/Discount');
const { v4: uuidv4 } = require('uuid');

class DiscountService {
  // Create a new discount code (admin only)
  async createDiscount(discountData, userId) {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minOrderValue,
        startDate,
        endDate
      } = discountData;
      
      // Validate discount type
      if (!['percentage', 'fixed'].includes(discountType)) {
        throw new Error('Invalid discount type. Must be percentage or fixed');
      }
      
      // Validate percentage discount (must be between 1 and 100)
      if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
        throw new Error('Percentage discount must be between 1 and 100');
      }
      
      // Check if code already exists
      const existingDiscount = await Discount.findOne({ code });
      if (existingDiscount) {
        throw new Error('Discount code already exists');
      }
      
      // Generate discount ID
      const discountId = 'DISC-' + uuidv4().substring(0, 8).toUpperCase();
      
      // Create new discount
      const newDiscount = new Discount({
        discountId,
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        minOrderValue: minOrderValue || 0,
        startDate,
        endDate,
        createdBy: userId
      });
      
      await newDiscount.save();
      return newDiscount;
    } catch (error) {
      throw error;
    }
  }
  
  // Get all discounts (admin only)
  async getAllDiscounts() {
    try {
      const discounts = await Discount.find({ deleted: false })
        .sort({ createdAt: -1 });
        
      return discounts;
    } catch (error) {
      throw error;
    }
  }
  
  // Get discount by ID
  async getDiscountById(id) {
    try {
      const discount = await Discount.findById(id);
      
      if (!discount) {
        throw new Error('Discount not found');
      }
      
      return discount;
    } catch (error) {
      throw error;
    }
  }
  
  // Update discount (admin only)
  async updateDiscount(id, discountData) {
    try {
      const discount = await Discount.findById(id);
      
      if (!discount) {
        throw new Error('Discount not found');
      }
      
      // Update fields
      if (discountData.description) discount.description = discountData.description;
      if (discountData.discountType) {
        if (!['percentage', 'fixed'].includes(discountData.discountType)) {
          throw new Error('Invalid discount type. Must be percentage or fixed');
        }
        discount.discountType = discountData.discountType;
      }
      
      if (discountData.discountValue !== undefined) {
        if (discount.discountType === 'percentage' && 
            (discountData.discountValue < 1 || discountData.discountValue > 100)) {
          throw new Error('Percentage discount must be between 1 and 100');
        }
        discount.discountValue = discountData.discountValue;
      }
      
      if (discountData.minOrderValue !== undefined) {
        discount.minOrderValue = discountData.minOrderValue;
      }
      
      if (discountData.startDate) discount.startDate = discountData.startDate;
      if (discountData.endDate) discount.endDate = discountData.endDate;
      
      await discount.save();
      return discount;
    } catch (error) {
      throw error;
    }
  }
  
  // Delete discount (admin only)
  async deleteDiscount(id, userId) {
    try {
      const discount = await Discount.findById(id);
      
      if (!discount) {
        throw new Error('Discount not found');
      }
      
      await discount.delete({ deletedBy: userId });
      return { message: 'Discount deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
  
  // Validate and apply discount code
  async applyDiscount(code, orderAmount) {
    try {
      const discount = await Discount.findOne({
        code: code.toUpperCase(),
        deleted: false
      });
      
      if (!discount) {
        throw new Error('Invalid discount code');
      }
      
      // Check if discount is active (date range)
      const now = new Date();
      if (now < discount.startDate || now > discount.endDate) {
        throw new Error('Discount code has expired or is not yet active');
      }
      
      // Check minimum order value
      if (orderAmount < discount.minOrderValue) {
        throw new Error(`Minimum order amount of ${discount.minOrderValue} not met`);
      }
      
      // Calculate discount amount
      let discountAmount = 0;
      
      if (discount.discountType === 'percentage') {
        discountAmount = (orderAmount * discount.discountValue) / 100;
      } else {
        // Fixed amount discount
        discountAmount = discount.discountValue > orderAmount ? orderAmount : discount.discountValue;
      }
      
      return {
        discount,
        discountAmount,
        finalPrice: orderAmount - discountAmount
      };
    } catch (error) {
      throw error;
    }
  }
  
  // Validate discount code without applying
  async validateDiscount(code, orderAmount) {
    try {
      return await this.applyDiscount(code, orderAmount);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new DiscountService();
