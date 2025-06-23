const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class UploadController {
  constructor() {
    // Ensure upload directory exists
    this.uploadDir = path.join(__dirname, '../uploads');
    this.imagesDir = path.join(this.uploadDir, 'images');
    this.productsDir = path.join(this.imagesDir, 'products');
    
    this.ensureDirectoriesExist();
    this.storage = this.createStorage();
    this.upload = this.createUploadMiddleware();
  }

  ensureDirectoriesExist() {
    const directories = [this.uploadDir, this.imagesDir, this.productsDir];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  createStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        const type = req.body.type || 'product';
        let uploadPath = this.productsDir; // default to products
        
        switch (type) {
          case 'product':
            uploadPath = this.productsDir;
            break;
          case 'user':
            uploadPath = path.join(this.imagesDir, 'users');
            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true });
            }
            break;
          default:
            uploadPath = this.productsDir;
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Create unique filename with timestamp and UUID
        const timestamp = Date.now();
        const uniqueId = uuidv4().substring(0, 8);
        const ext = path.extname(file.originalname);
        const fileName = `${timestamp}-${uniqueId}${ext}`;
        cb(null, fileName);
      }
    });
  }

  createUploadMiddleware() {
    return multer({
      storage: this.storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files at once
      },
      fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
        }
      }
    });
  }

  // Upload single image
  uploadSingleImage = (req, res) => {
    this.upload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading file'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Generate URL for the uploaded file
      const fileUrl = `/uploads/images/products/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size
        }
      });
    });
  };

  // Upload multiple images
  uploadMultipleImages = (req, res) => {
    this.upload.array('images', 10)(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'Error uploading files'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Generate URLs for all uploaded files
      const uploadedFiles = req.files.map(file => ({
        url: `/uploads/images/products/${file.filename}`,
        filename: file.filename,
        originalname: file.originalname,
        size: file.size
      }));

      res.status(200).json({
        success: true,
        message: `${req.files.length} images uploaded successfully`,
        data: {
          files: uploadedFiles,
          count: req.files.length
        }
      });
    });
  };

  // Delete uploaded file
  async deleteFile(req, res) {
    try {
      const { filename } = req.params;
      const { type = 'product' } = req.query;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Filename is required'
        });
      }

      let filePath;
      switch (type) {
        case 'product':
          filePath = path.join(this.productsDir, filename);
          break;
        case 'user':
          filePath = path.join(this.imagesDir, 'users', filename);
          break;
        default:
          filePath = path.join(this.productsDir, filename);
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete the file
      fs.unlinkSync(filePath);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file'
      });
    }
  }
}

module.exports = new UploadController();
