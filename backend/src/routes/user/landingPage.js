const { Router } = require("express");
const router = Router();

const { getLandingPagePublic } = require("../../controllers/user/landingPage.js");

router.get("/", getLandingPagePublic);

module.exports = router;
