const { Router } = require("express");
const router = Router();

const { getMarketingPagePublic } = require("../../controllers/user/marketingPage.js");

router.get("/", getMarketingPagePublic);

module.exports = router;
