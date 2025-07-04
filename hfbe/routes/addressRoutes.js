// Address Routes
const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/AddressController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Get all addresses for a user
router.get('/', isAuthenticated, AddressController.getUserAddresses);

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

// Find or create address (for checkout to prevent duplicates)
router.post('/find-or-create', isAuthenticated, AddressController.findOrCreateAddress);

module.exports = router;
