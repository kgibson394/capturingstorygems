const { Schema, model, Types } = require("mongoose");

const planSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      required: true,
    },
    allowedStories: {
      type: Number,
      required: true,
    },
    billingCycle: {
      type: String,
      default: "monthly",
    },
    group: {
      type: Types.ObjectId,
      ref: "Group",
      default: null,
    },
    features: [String],
    featured: {
        type: Boolean,
        default: false,
    }
  },
  { timestamps: true }
);

module.exports = model("Plan", planSchema);
