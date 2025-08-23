const { Router } = require("express");
const router = Router();
const { loginAdmin } = require("../../controllers/admin/auth");
const { bodyValidator } = require("../../middlewares/joi.js");

router.post("/login", bodyValidator("login"), loginAdmin);

module.exports = router;
