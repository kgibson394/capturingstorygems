const { Schema, model, Types } = require("mongoose");

const storySchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    user_story: {
      type: String,
      required: true,
    },
    qa: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          default: null,
        },
      },
    ],
    // hero image for the story
    heroImageUrl: {
      type: String,
      default: null,
    },
    heroImageAlignment: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center",
    },
    story_title: {
      type: String,
      default: null,
    },
    book_version_title: {
      type: String,
      default: function () {
        return this.story_title || null;
      },
    },
    read_time: {
      type: String,
      default: null,
    },
    genre: {
      type: String,
      default: null,
    },
    enhanced_story: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = model("Story", storySchema);
