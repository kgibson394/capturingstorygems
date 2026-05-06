const { Router } = require("express");
const router = Router();

const { calculatePrintCost } = require("../../controllers/user/lulu.js");
const { verifyUserToken } = require("../../middlewares/authMiddleware.js");

// Calculate Lulu print job cost
router.post("/print-cost", verifyUserToken, calculatePrintCost);

module.exports = router;