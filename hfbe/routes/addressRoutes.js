// Address Routes
const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/AddressController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Get all addresses for a user
router.get('/', isAuthenticated, AddressController.getUserAddresses);

// Get default address for a user
router.get('/default', isAuthenticated, AddressController.getDefaultAddress);

// Get address by ID
router.get('/:id', isAuthenticated, AddressController.getAddressById);

// Create new address
router.post('/', isAuthenticated, AddressController.createAddress);

// Update address
router.put('/:id', isAuthenticated, AddressController.updateAddress);

// Delete address
router.delete('/:id', isAuthenticated, AddressController.deleteAddress);

// Set address as default
router.patch('/:id/default', isAuthenticated, AddressController.setAsDefault);

module.exports = router;
