const { Router } = require("express");
const router = Router();

const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");
const {
  getInvitationPage,
  upsertInvitationPage,
} = require("../../controllers/admin/invitationPage.js");

router.get("/", verifyAdminToken, getInvitationPage);
router.put("/", verifyAdminToken, upsertInvitationPage);

module.exports = router;
