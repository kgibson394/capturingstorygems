const { Router } = require("express");
const router = Router();
const {
  registerUser,
  googleLoginUser,
  verifyUser,
  resendOtp,
  loginUser,
  updatePassword,
  forgotPassword,
  resetPassword,
} = require("../../controllers/user/auth.js");
const { bodyValidator } = require("../../middlewares/joi.js");
const { verifyUserToken } = require("../../middlewares/authMiddleware.js");
const { blockPublicUsers } = require("../../middlewares/blockPublicUsers.js");

router.post("/register", bodyValidator("userRegisterSchema"), registerUser);

router.post("/verify-email", bodyValidator("verifyUserSchema"), verifyUser);

router.post("/resend-otp", bodyValidator("resendSchema"), resendOtp);

router.post("/google-login", bodyValidator("googleLogin"), googleLoginUser);

router.post("/login", bodyValidator("login"), loginUser);

router.post("/forgot-password", bodyValidator("emailSchema"), forgotPassword);

router.post("/reset-password", bodyValidator("resetPassword"), resetPassword);

router.put(
  "/update-password",
  verifyUserToken,
  blockPublicUsers,
  bodyValidator("passwordUpdate"),
  updatePassword
);

module.exports = router;
