const { Router } = require("express");
const router = Router();
const {
  getPlans,
  createPlan,
  getPlan,
  editPlan,
  deletePlan,
} = require("../../controllers/admin/plan.js");
const { bodyValidator, queryValidator } = require("../../middlewares/joi.js");
const { verifyAdminToken } = require("../../middlewares/authMiddleware.js");

router.get("/", verifyAdminToken, queryValidator("paginationSchema"), getPlans);

router.post(
  "/",
  verifyAdminToken,
  bodyValidator("createPlanSchema"),
  createPlan
);

router.get("/:planId", verifyAdminToken, getPlan);

router.put(
  "/:planId",
  verifyAdminToken,
  bodyValidator("createPlanSchema"),
  editPlan
);

router.delete("/:planId", verifyAdminToken, deletePlan);

module.exports = router;
