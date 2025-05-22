const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const billingSchema = new Schema(
  {
    billingId: { type: String, unique: true, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    paymentMethodId: { type: mongoose.Schema.Types.ObjectId, ref: "PaymentMethod", required: true },    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["pending", "success", "shipping", "failed"], default: "pending" },
    transactionId: { type: String, default: "" },
    note: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  {
    collection: "Billing",
    timestamps: true,
  }
);

billingSchema.plugin(mongooseDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Billing", billingSchema);