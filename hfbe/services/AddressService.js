// Address service
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
  async createAddress(addressData, userId) {
    try {
      // Generate unique addressId
      const addressId = 'ADDR-' + uuidv4().substring(0, 8).toUpperCase();
      
      const newAddress = new Address({
        addressId,
        userId,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state || '',
        country: addressData.country,
        postalCode: addressData.postalCode || '',
        createdBy: userId
      });
      
      await newAddress.save();
      return newAddress;
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
            street: addressData.street,
            city: addressData.city,
            state: addressData.state || '',
            country: addressData.country,
            postalCode: addressData.postalCode || '',
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
