const express = require('express');
const router = express.Router();
const {
  createAddress,
  getMyAddresses,
  getAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

// Protected routes - require authentication
router.post('/', protect, createAddress);
router.get('/', protect, getMyAddresses);
router.get('/:id', protect, getAddress);
router.put('/:id', protect, updateAddress);
router.delete('/:id', protect, deleteAddress);

module.exports = router;
