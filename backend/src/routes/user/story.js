const { Router } = require("express");
const router = Router();
const {
  createStory,
  generateStory,
  resendStory,
  getUserStories,
  reviseStory,
  uploadHeroImage,
  deleteStory,
  seedMockStoriesForMe,
} = require("../../controllers/user/story.js");
const { verifyUserToken } = require("../../middlewares/authMiddleware.js");
const { blockPublicUsers } = require("../../middlewares/blockPublicUsers.js");
const { bodyValidator } = require("../../middlewares/joi.js");

router.post("/", verifyUserToken, bodyValidator("storySchema"), createStory);

router.post("/generate", verifyUserToken, generateStory);

router.get("/resend", verifyUserToken, blockPublicUsers, resendStory);

router.get("/", verifyUserToken, getUserStories);

// router.put("/:storyId", verifyUserToken,  bodyValidator("storySchema"), reviseStory);
router.put("/:storyId", verifyUserToken, bodyValidator("reviseStorySchema"), reviseStory);

router.post('/:storyId/hero', verifyUserToken, uploadHeroImage);

router.delete("/:storyId", verifyUserToken, deleteStory);

router.post("/seed", verifyUserToken, seedMockStoriesForMe);

module.exports = router;
