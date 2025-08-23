const { Router } = require("express");
const router = Router();
const {
  getUsers,
  getDashboardData,
  updateStatus,
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

module.exports = router;
