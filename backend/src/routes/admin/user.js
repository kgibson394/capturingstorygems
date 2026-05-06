const { Router } = require("express");
const router = Router();
const {
  getUsers,
  getDashboardData,
  updateStatus,
  updateDiscount,
  deleteUser,
} = require("../../controllers/admin/user");
const { queryValidator } = require("../../middlewares/joi.js");
const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");

router.get("/", verifyAdminToken, queryValidator("getUsers"), getUsers);

router.get("/dashboard", verifyAdminToken, getDashboardData);

router.put(
  "/:userId/status",
  verifyAdminToken,
  queryValidator("updateStatus"),
  updateStatus
);

router.put("/:userId/discount", verifyAdminToken, updateDiscount);

router.delete("/:userId", verifyAdminToken, deleteUser);

module.exports = router;
