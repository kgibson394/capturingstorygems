const { Router } = require("express");
const router = Router();

const authRoutes = require("./auth.js");
const planRoutes = require("./plan.js");
const storyRoutes = require("./story.js");

router.use("/auth", authRoutes);
router.use("/plan", planRoutes);
router.use("/story", storyRoutes);

module.exports = router;
