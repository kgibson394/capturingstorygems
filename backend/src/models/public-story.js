const { Schema, model } = require("mongoose");

const publicStorySchema = new Schema(
  {
    author: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    story: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = model("PublicStory", publicStorySchema);
