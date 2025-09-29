const { Router } = require("express");
const router = Router();
const {
  getAllPlans,
  getSubscription,
  createCheckout,
} = require("../../controllers/user/plan.js");
const { verifyUserToken, verifyToken } = require("../../middlewares/authMiddleware.js");
const { blockPublicUsers } = require("../../middlewares/blockPublicUsers.js");

router.post(
  "/create-checkout-session",
  verifyUserToken,
  blockPublicUsers,
  createCheckout
);

router.get("/", verifyToken, getAllPlans);

router.get("/subscription", verifyUserToken, blockPublicUsers, getSubscription);

module.exports = router;
