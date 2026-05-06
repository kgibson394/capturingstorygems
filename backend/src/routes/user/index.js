const { Router } = require("express");
const router = Router();

const authRoutes = require("./auth.js");
const planRoutes = require("./plan.js");
const storyRoutes = require("./story.js");
const bookRoutes = require("./book.js");
const cartRoutes = require("./cart.js");
const landingPageRoutes = require("./landingPage.js");
const marketingPageRoutes = require("./marketingPage.js");
const newsletterRoutes = require("./newsletter.js");

router.use("/auth", authRoutes);
router.use("/plan", planRoutes);
router.use("/story", storyRoutes);
router.use("/book", bookRoutes);
router.use("/cart", cartRoutes);
router.use("/landing-page", landingPageRoutes);
router.use("/marketing-page", marketingPageRoutes);
router.use("/newsletter", newsletterRoutes);

module.exports = router;