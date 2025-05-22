const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

// Safe model registration function
const getProductModel = () => {
  // Check if the model is already registered to prevent duplicate registration error
  try {
    // Try to get existing model first
    return mongoose.model("Product");
  } catch (err) {
    // If model doesn't exist, define and register it
    const productSchema = new Schema(
      {
        productId: { type: String, unique: true, required: true },
        name: { type: String, required: true },
        description: { type: String, default: "" },
        price: { type: Number, required: true },
        salePrice: { type: Number, default: 0 },
        stock: { type: Number, required: true, min: 0 },
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        thumbnailImage: { type: String, default: "" }, // Thumbnail image for listings and cart
        images: [{ type: String }], // Array of images for product detail view
        rating: { type: Number, default: 4.5, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0, min: 0 },
        materials: { type: String, default: "" },
        dimensions: { type: String, default: "" },
        deleted: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      },
      {
        collection: "Product",
        timestamps: true,
      }
    );

    productSchema.plugin(mongooseDelete, {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: "all",
    });
    
    // Register the model
    return mongoose.model("Product", productSchema);
  }
};

module.exports = getProductModel();