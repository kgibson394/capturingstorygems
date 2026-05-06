const { Schema, model } = require("mongoose");

const landingPageSchema = new Schema(
  {
    key: {
      type: String,
      default: "default",
      unique: true,
      index: true,
    },
    // Stored as a flexible JSON object to avoid schema churn as sections evolve.
    content: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = model("LandingPage", landingPageSchema);
