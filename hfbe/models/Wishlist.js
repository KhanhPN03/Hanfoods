const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const wishlistSchema = new Schema(
  {
    wishlistId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    deleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  {
    collection: "Wishlist",
    timestamps: true,
  }
);

wishlistSchema.plugin(mongooseDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Wishlist", wishlistSchema);