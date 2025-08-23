const { Router } = require("express");
const router = Router();

const authRoutes = require("./auth.js");
const userRoutes = require("./user.js");
const planRoutes = require("./plan.js");
const storyRoutes = require("./story.js");
const promptRoutes = require("./prompt.js");
const publicUserRoutes = require("./publicUser.js");

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/plan", planRoutes);
router.use("/story", storyRoutes);
router.use("/prompt", promptRoutes);
router.use("/public-user", publicUserRoutes);

module.exports = router;
