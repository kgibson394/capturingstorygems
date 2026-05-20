const { Router } = require("express");
const router = Router();

const authRoutes = require("./auth.js");
const userRoutes = require("./user.js");
const planRoutes = require("./plan.js");
const storyRoutes = require("./story.js");
const promptRoutes = require("./prompt.js");
const publicUserRoutes = require("./publicUser.js");
const groupRoutes = require("./group.js");
const landingPageRoutes = require("./landingPage.js");
const marketingPageRoutes = require("./marketingPage.js");
const emailTemplateRoutes = require("./emailTemplate.js");
const invitationPageRoutes = require("./invitationPage.js");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/plan", planRoutes);
router.use("/story", storyRoutes);
router.use("/prompt", promptRoutes);
router.use("/public-user", publicUserRoutes);
router.use("/group", groupRoutes);
router.use("/landing-page", landingPageRoutes);
router.use("/marketing-page", marketingPageRoutes);
router.use("/email-template", emailTemplateRoutes);
router.use("/invitation-page", invitationPageRoutes);

module.exports = router;
