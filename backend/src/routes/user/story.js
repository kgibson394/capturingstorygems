const { Router } = require("express");
const router = Router();
const {
  createStory,
  generateStory,
  resendStory,
  getUserStories,
  reviseStory,
  deleteStory,
} = require("../../controllers/user/story.js");
const { verifyUserToken } = require("../../middlewares/authMiddleware.js");
const { blockPublicUsers } = require("../../middlewares/blockPublicUsers.js");
const { bodyValidator } = require("../../middlewares/joi.js");

router.post("/", verifyUserToken, bodyValidator("storySchema"), createStory);

router.post("/generate", verifyUserToken, generateStory);

router.get("/resend", verifyUserToken, blockPublicUsers, resendStory);

router.get("/", verifyUserToken, getUserStories);

router.put("/:storyId", verifyUserToken,  bodyValidator("storySchema"), reviseStory);

router.delete("/:storyId", verifyUserToken, deleteStory);

module.exports = router;
