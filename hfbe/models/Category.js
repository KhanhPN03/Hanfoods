const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

// Safe model registration function for Category
const getCategoryModel = () => {
  // Check if the model is already registered to prevent duplicate registration error
  try {
    // Try to get existing model first
    return mongoose.model("Category");
  } catch (err) {
    // If model doesn't exist, define and register it
    const categorySchema = new Schema(
      {
        categoryId: { type: String, unique: true, required: true },
        name: { type: String, required: true },
        description: { type: String, default: "" },
        deleted: { type: Boolean, default: false },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      },
      {
        collection: "Category",
        timestamps: true,
      }
    );

    categorySchema.plugin(mongooseDelete, {
      deletedBy: true,
      deletedAt: true,
      overrideMethods: "all",
    });
    
    // Register the model
    return mongoose.model("Category", categorySchema);
  }
};

module.exports = getCategoryModel();