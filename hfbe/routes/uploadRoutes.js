const express = require('express');
const router = express.Router();
const UploadController = require('../controllers/UploadController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Upload single image (admin only)
router.post('/image', isAuthenticated, isAdmin, UploadController.uploadSingleImage);

// Upload multiple images (admin only)
router.post('/images', isAuthenticated, isAdmin, UploadController.uploadMultipleImages);

// Delete uploaded file (admin only)
router.delete('/file/:filename', isAuthenticated, isAdmin, UploadController.deleteFile);

module.exports = router;
