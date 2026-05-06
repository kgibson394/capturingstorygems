const { Schema, model } = require("mongoose");

const marketingPageSchema = new Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      index: true,
    },
    content: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = model("MarketingPage", marketingPageSchema);
