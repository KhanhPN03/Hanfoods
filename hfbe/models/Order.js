const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const orderSchema = new Schema(
  {
    orderId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      }
    ],
    discountId: { type: mongoose.Schema.Types.ObjectId, ref: "Discount" },
    discountAmount: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  {
    collection: "Order",
    timestamps: true,
  }
);

orderSchema.plugin(mongooseDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Order", orderSchema);