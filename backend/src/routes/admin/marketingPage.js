const { Router } = require("express");
const router = Router();

const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");
const {
  getMarketingPage,
  updateMarketingPage,
  uploadMarketingPageImage,
} = require("../../controllers/admin/marketingPage.js");

router.get("/", verifyAdminToken, getMarketingPage);
router.put("/", verifyAdminToken, updateMarketingPage);
router.post("/upload-image", verifyAdminToken, uploadMarketingPageImage);

module.exports = router;
