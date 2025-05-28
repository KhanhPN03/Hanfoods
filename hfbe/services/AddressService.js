// Address service with support for checkout process
const Address = require('../models/Address');
const { v4: uuidv4 } = require('uuid');

class AddressService {
  // Get user's addresses
  async getUserAddresses(userId) {
    try {
      const addresses = await Address.find({ userId });
      return addresses;
    } catch (error) {
      throw error;
    }
  }
  
  // Get address by ID
  async getAddressById(addressId, userId) {
    try {
      const address = await Address.findOne({ 
        _id: addressId,
        userId 
      });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      return address;
    } catch (error) {
      throw error;
    }
  }
  
  // Create new address
  async createAddress(userId, addressData) {
    try {
      // Generate unique addressId
      const addressId = 'ADDR-' + uuidv4().substring(0, 8).toUpperCase();
      
      // Map frontend address format to backend format
      const newAddress = new Address({
        addressId,
        userId,
        street: addressData.address || '',
        city: addressData.province || addressData.city || '',
        state: addressData.district || '',
        country: 'Vietnam',
        postalCode: '',
        isDefault: addressData.isDefault || false,
        fullName: addressData.fullName || '',
        phone: addressData.phone || '',
        ward: addressData.ward || '',
        notes: addressData.notes || '',
        createdBy: userId
      });
      
      await newAddress.save();
      return newAddress;
    } catch (error) {
      throw error;
    }
  }
  
  // Find or create address based on checkout data
  async findOrCreateAddress(userId, addressData) {
    try {
      // Check if a similar address already exists
      const existingAddress = await Address.findOne({
        userId,
        street: addressData.address || '',
        city: addressData.province || addressData.city || '',
        state: addressData.district || '',
        fullName: addressData.fullName || '',
        phone: addressData.phone || '',
        ward: addressData.ward || ''
      });
      
      if (existingAddress) {
        return existingAddress;
      }
      
      // Create new address if not found
      return await this.createAddress(userId, addressData);
    } catch (error) {
      throw error;
    }
  }
  
  // Update address
  async updateAddress(addressId, addressData, userId) {
    try {
      const address = await Address.findOne({ _id: addressId, userId });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      const updatedAddress = await Address.findByIdAndUpdate(
        addressId,
        {
          $set: {
            street: addressData.street || addressData.address || '',
            city: addressData.city || addressData.province || '',
            state: addressData.state || addressData.district || '',
            country: addressData.country || 'Vietnam',
            postalCode: addressData.postalCode || '',
            fullName: addressData.fullName || '',
            phone: addressData.phone || '',
            ward: addressData.ward || ''
          }
        },
        { new: true }
      );
      
      return updatedAddress;
    } catch (error) {
      throw error;
    }
  }
  
  // Delete address
  async deleteAddress(addressId, userId) {
    try {
      const address = await Address.findOne({ _id: addressId, userId });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      await Address.findByIdAndDelete(addressId);
      return address;
    } catch (error) {
      throw error;
    }
  }
  
  // Set address as default
  async setAsDefault(addressId, userId) {
    try {
      // Find the address
      const address = await Address.findOne({ _id: addressId, userId });
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      // Unset default on all other user addresses
      await Address.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
      
      // Set this address as default
      address.isDefault = true;
      await address.save();
      
      return address;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AddressService();
