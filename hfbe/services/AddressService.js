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
      // Normalize address data to handle different input formats
      const normalizedAddress = {
        street: addressData.address || addressData.street || '',
        city: addressData.province || addressData.city || '',
        state: addressData.district || addressData.state || '',
        ward: addressData.ward || '',
        fullName: addressData.fullName || '',
        phone: addressData.phone || ''
      };
      
      // Clean up strings by trimming and converting to lowercase for better comparison
      Object.keys(normalizedAddress).forEach(key => {
        if (typeof normalizedAddress[key] === 'string') {
          normalizedAddress[key] = normalizedAddress[key].trim().toLowerCase();
        }
      });
      
      // Create query to find similar addresses
      // A similar address must match on street, city, state, ward, and contact info
      const query = {
        userId,
        $or: [
          // Exact match on all important fields
          {
            street: { $regex: new RegExp('^' + escapeRegExp(normalizedAddress.street) + '$', 'i') },
            city: { $regex: new RegExp('^' + escapeRegExp(normalizedAddress.city) + '$', 'i') },
            state: { $regex: new RegExp('^' + escapeRegExp(normalizedAddress.state) + '$', 'i') },
            ward: { $regex: new RegExp('^' + escapeRegExp(normalizedAddress.ward) + '$', 'i') },
            phone: normalizedAddress.phone
          },
          // Match with different capitalization or minor differences
          {
            street: { $regex: new RegExp(escapeRegExp(normalizedAddress.street), 'i') },
            city: { $regex: new RegExp(escapeRegExp(normalizedAddress.city), 'i') },
            state: { $regex: new RegExp(escapeRegExp(normalizedAddress.state), 'i') },
            ward: { $regex: new RegExp(escapeRegExp(normalizedAddress.ward), 'i') },
            phone: normalizedAddress.phone,
            fullName: { $regex: new RegExp(escapeRegExp(normalizedAddress.fullName), 'i') }
          }
        ]
      };
      
      const existingAddress = await Address.findOne(query);
      
      if (existingAddress) {
        console.log('Found existing address, returning it instead of creating a new one');
        return existingAddress;
      }
      
      // Create new address if not found
      console.log('No existing address found, creating a new one');
      return await this.createAddress(userId, addressData);
    } catch (error) {
      console.error('Error in findOrCreateAddress:', error);
      throw error;
    }
  }
  
  // Helper function to escape special characters in regex
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
