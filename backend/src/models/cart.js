const { Schema, model, Types } = require("mongoose");

const shippingSchema = new Schema(
  {
    city: String,
    country_code: String,
    postcode: String,
    state_code: String,
    street1: String,
    phone_number: String,
    name: String,
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String },
    name: { type: String },
    email: { type: String },
    pdfUrl: { type: String },
    coverPdfUrl: { type: String },
    // whether the customer has completed payment for this cart item
    paymentPaid: { type: Boolean, default: false },
    // optional stripe transaction/session id for reference
    paymentTransactionId: { type: String },
    shipping_address: { type: shippingSchema, required: true },
    shipping_option: { type: String },
    pod_package_id: { type: String },
    quantity: { type: Number, default: 1 },
    page_count: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    currency: { type: String, default: "" },
    status: { type: String },
  },
  { timestamps: true }
);

module.exports = model("Cart", cartSchema);
