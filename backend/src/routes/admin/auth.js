const { Router } = require("express");
const router = Router();
const { loginAdmin, updatePassword } = require("../../controllers/admin/auth");
const { bodyValidator } = require("../../middlewares/joi.js");
const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");

router.post("/login", bodyValidator("login"), loginAdmin);

router.put(
  "/update-password",
  verifyAdminToken,
  bodyValidator("passwordUpdate"),
  updatePassword
);


module.exports = router;
