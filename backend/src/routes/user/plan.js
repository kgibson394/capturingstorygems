const { Router } = require("express");
const router = Router();
const {
  getAllPlans,
  getSubscription,
  createCheckout,
  pauseSubscription,
  resumeSubscription,
} = require("../../controllers/user/plan.js");
const { verifyUserToken } = require("../../middlewares/authMiddleware.js");
const { blockPublicUsers } = require("../../middlewares/blockPublicUsers.js");

router.post(
  "/create-checkout-session",
  verifyUserToken,
  blockPublicUsers,
  createCheckout
);

router.get("/", verifyUserToken, blockPublicUsers, getAllPlans);

router.get("/subscription", verifyUserToken, blockPublicUsers, getSubscription);

router.put("/pause", verifyUserToken, blockPublicUsers, pauseSubscription);

router.put("/resume", verifyUserToken, blockPublicUsers, resumeSubscription);

module.exports = router;
