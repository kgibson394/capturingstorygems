const { Schema, model } = require("mongoose");

const promptSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Prompt", promptSchema);
