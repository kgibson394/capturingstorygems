const { Router } = require("express");
const router = Router();

const { subscribeNewsletter } = require("../../controllers/user/newsletter.js");

router.post("/subscribe", subscribeNewsletter);

module.exports = router;
