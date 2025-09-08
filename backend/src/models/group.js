const { Schema, model, Types } = require("mongoose");

const groupSchema = new Schema(
  {
    groupTag: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    users: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Group", groupSchema);
