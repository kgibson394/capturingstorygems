const express = require("express");
const router = express.Router();
const {
  createPublicStory,
  getAllPublicStories,
  getPublicStories,
  updateStory,
  deleteStory,
} = require("../../controllers/admin/publicStory.js");
const { bodyValidator, queryValidator } = require("../../middlewares/joi.js");
const { verifyAdminToken } = require("../../middlewares/authMiddleware");

router.get("/all", getAllPublicStories);

router.get(
  "/",
  verifyAdminToken,
  queryValidator("paginationSchema"),
  getPublicStories
);

router.post(
  "/",
  verifyAdminToken,
  bodyValidator("publicStorySchema"),
  createPublicStory
);

router.put(
  "/:storyId",
  verifyAdminToken,
  bodyValidator("publicStorySchema"),
  updateStory
);

router.delete("/:storyId", verifyAdminToken, deleteStory);

module.exports = router;
