const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");

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

module.exports = mongoose.model("Category", categorySchema);