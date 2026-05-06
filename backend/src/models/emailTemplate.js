const { Schema, model } = require("mongoose");

const emailTemplateSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    subject: {
      type: String,
      default: "",
    },
    html: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = model("EmailTemplate", emailTemplateSchema);
