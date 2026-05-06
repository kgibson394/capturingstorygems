const { Router } = require("express");
const router = Router();

const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");
const {
  getLandingPage,
  updateLandingPage,
  uploadLandingPageImage,
} = require("../../controllers/admin/landingPage.js");

router.get("/", verifyAdminToken, getLandingPage);
router.put("/", verifyAdminToken, updateLandingPage);
router.post("/upload-image", verifyAdminToken, uploadLandingPageImage);

module.exports = router;
