const {
  getUsers,
  paginationSchema,
  updateStatus,
  createPlanSchema,
  updatePromptSchema,
  publicStorySchema,
} = require("./admin");

const {
  userRegisterSchema,
  publicUserRegisterSchema,
  googleLogin,
  verifyUserSchema,
  resendSchema,
  login,
  emailSchema,
  resetPassword,
  passwordUpdate,
  updatePublicUserSchema,
  storySchema,
} = require("./users/index");

module.exports = {
  getUsers,
  paginationSchema,
  updateStatus,
  createPlanSchema,
  updatePromptSchema,
  publicStorySchema,
  userRegisterSchema,
  publicUserRegisterSchema,
  googleLogin,
  verifyUserSchema,
  resendSchema,
  login,
  emailSchema,
  resetPassword,
  passwordUpdate,
  updatePublicUserSchema,
  storySchema,
};
