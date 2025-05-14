const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

const addressSchema = new Schema(
  {
    addressId: { type: String, unique: true, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: "" },
    country: { type: String, required: true },
    postalCode: { type: String, default: "" },
    deleted: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
  },
  {
    collection: "Address",
    timestamps: true,
  }
);

addressSchema.plugin(mongooseDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Address", addressSchema);