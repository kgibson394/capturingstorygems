const { Schema, model } = require("mongoose");

const invitationPageSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
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

module.exports = model("InvitationPage", invitationPageSchema);
