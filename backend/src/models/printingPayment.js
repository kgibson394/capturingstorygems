const { Schema, model, Types } = require("mongoose");

const printingPaymentSchema = new Schema(
  {
    transactionId: { type: String, required: true },
    cartId: { type: Types.ObjectId, ref: "Cart" },
    userId: { type: Types.ObjectId, ref: "User" },
    amount: { type: Number },
    currency: { type: String },
    status: { type: String },
    metadata: { type: Schema.Types.Mixed },
    raw: { type: Schema.Types.Mixed },
    dateCreated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model("PrintingPayment", printingPaymentSchema);
