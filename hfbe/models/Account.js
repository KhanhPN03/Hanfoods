const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
const mongooseDelete = require("mongoose-delete");

const accountSchema = new Schema(
  {
    googleID: { type: String, default: "" },
    email: { type: String, unique: true, required: true },
    accountCode: { type: String, unique: true },
    username: { type: String, required: true, unique: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    firstname: { type: String, default: "" },
    lastname: { type: String, default: "" },
    DOB: { type: Date, default: null },
    gender: { type: String, enum: ["male", "female", ""], default: "" },
    phone: { type: String, default: "" },
    avatar: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    addressId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      default: null
    },
    deleted: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  {
    collection: "Account",
    timestamps: true,
  }
);

accountSchema.plugin(passportLocalMongoose, { usernameField: "email" });
accountSchema.plugin(mongooseDelete, {
  deletedBy: true,
  deletedAt: true,
  overrideMethods: "all",
});

module.exports = mongoose.model("Account", accountSchema);