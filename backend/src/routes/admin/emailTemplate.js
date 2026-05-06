const { Router } = require("express");
const router = Router();

const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");
const {
  getEmailTemplate,
  upsertEmailTemplate,
} = require("../../controllers/admin/emailTemplate.js");

router.get("/", verifyAdminToken, getEmailTemplate);
router.put("/", verifyAdminToken, upsertEmailTemplate);

module.exports = router;
