// Address controller
const AddressService = require('../services/AddressService');

class AddressController {
  // Get all addresses for a user
  async getUserAddresses(req, res) {
    try {
      const userId = req.user._id;
      const addresses = await AddressService.getUserAddresses(userId);
      
      return res.status(200).json({
        success: true,
        addresses
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
    // Get address by ID
  async getAddressById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const address = await AddressService.getAddressById(id, userId);
      
      return res.status(200).json({
        success: true,
        address
      });
    } catch (error) {
      return res.status(404).json({ success: false, message: error.message });
    }
  }
  
  // Get default address for a user
  async getDefaultAddress(req, res) {
    try {
      const userId = req.user._id;
      
      const address = await AddressService.getUserDefaultAddress(userId);
      
      if (!address) {
        return res.status(404).json({
          success: false,
          message: 'No address found for this user'
        });
      }
      
      return res.status(200).json({
        success: true,
        address
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Create new address
  async createAddress(req, res) {
    try {
      const { street, city, state, country, postalCode } = req.body;
      const userId = req.user._id;
      
      // Validate required fields
      if (!street || !city || !country) {
        return res.status(400).json({ 
          success: false, 
          message: 'Street, city, and country are required fields' 
        });
      }
      
      const newAddress = await AddressService.createAddress(req.body, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Address created successfully',
        address: newAddress
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Update address
  async updateAddress(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const updatedAddress = await AddressService.updateAddress(id, req.body, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Address updated successfully',
        address: updatedAddress
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
    // Delete address
  async deleteAddress(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      await AddressService.deleteAddress(id, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Address deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
  
  // Set address as default
  async setAsDefault(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const address = await AddressService.setAsDefault(id, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Address set as default successfully',
        address
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AddressController();
