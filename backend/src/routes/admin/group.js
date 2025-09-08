const express = require("express");
const router = express.Router();
const {
  getGroups,
  getUsers,
  createGroup,
  addUsersToGroup,
  removeUserFromGroup,
  updateGroup,
  deleteGroup,
} = require("../../controllers/admin/group");
const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");

router.get("/", verifyAdminToken, getGroups);

router.get("/users", verifyAdminToken, getUsers);

router.post("/", verifyAdminToken, createGroup);

router.put("/:id/add-users", verifyAdminToken, addUsersToGroup);

router.put("/:id/remove-user", verifyAdminToken, removeUserFromGroup);

router.put("/:id", verifyAdminToken, updateGroup);

router.delete("/:id", verifyAdminToken, deleteGroup);

module.exports = router;
