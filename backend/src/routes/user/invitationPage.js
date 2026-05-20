const { Router } = require("express");
const router = Router();

const { getInvitationPagePublic } = require("../../controllers/user/invitationPage.js");

router.get("/", getInvitationPagePublic);

module.exports = router;
