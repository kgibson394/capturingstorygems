const express = require("express");
const router = express.Router();
const {
  createPublicUser,
  getPublicUsers,
  updatePublicUser,
  deleteUser,
} = require("../../controllers/admin/publicUser");
const { bodyValidator, queryValidator } = require("../../middlewares/joi.js");
const { verifyAdminToken } = require("../../middlewares/authMiddleware");

router.get(
  "/",
  verifyAdminToken,
  queryValidator("paginationSchema"),
  getPublicUsers
);

router.post(
  "/",
  verifyAdminToken,
  bodyValidator("publicUserRegisterSchema"),
  createPublicUser
);

router.put(
  "/:userId",
  verifyAdminToken,
  bodyValidator("updatePublicUserSchema"),
  updatePublicUser
);

router.delete("/:userId", verifyAdminToken, deleteUser);

module.exports = router;
