const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      default: null,
    },
    emailVerificationCodeExpiry: {
      type: Date,
      default: null,
    },
    forgotPasswordCode: {
      type: String,
      default: null,
    },
    forgotPasswordCodeExpiry: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "active", "blocked"],
      default: "pending",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    passwordExpiryDate: {
      type: Date,
      required: function () {
        return this.isPublic === true;
      },
      default: null,
    },
    storyExpiryDate: {
      type: Date,
      required: function () {
        return this.isPublic === true;
      },
      default: null,
    },
     groupId: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.virtual("subscription", {
  ref: "Subscription",
  localField: "_id",
  foreignField: "userId",
  justOne: true,
});

module.exports = model("User", userSchema);
