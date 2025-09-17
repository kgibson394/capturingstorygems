const express = require("express");
const router = express.Router();
const {
  getGroups,
  getAllGroups,
  getUsers,
  createGroup,
  addUsersToGroup,
  removeUserFromGroup,
  updateGroup,
  deleteGroup,
} = require("../../controllers/admin/group");
const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");
const { bodyValidator } = require("../../middlewares/joi");

router.get("/", verifyAdminToken, getGroups);

router.get("/all", verifyAdminToken, getAllGroups);

router.get("/users", verifyAdminToken, getUsers);

router.post("/", verifyAdminToken, bodyValidator("groupSchema"), createGroup);

router.put("/:id/add-users", verifyAdminToken, bodyValidator("userIdsSchema"), addUsersToGroup);

router.put("/:id/remove-user", verifyAdminToken, bodyValidator("userIdSchema"), removeUserFromGroup);

router.put("/:id", verifyAdminToken, bodyValidator("groupSchema"), updateGroup);

router.delete("/:id", verifyAdminToken, deleteGroup);

module.exports = router;
