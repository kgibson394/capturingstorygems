const { Router } = require("express");
const router = Router();
const {
  getPrompts,
  editPrompt,
} = require("../../controllers/admin/prompt.js");
const { bodyValidator, queryValidator } = require("../../middlewares/joi.js");
const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");

router.get("/", verifyAdminToken, queryValidator("paginationSchema"), getPrompts);

router.put(
  "/:promptId",
  verifyAdminToken,
  bodyValidator("updatePromptSchema"),
  editPrompt
);

module.exports = router;
