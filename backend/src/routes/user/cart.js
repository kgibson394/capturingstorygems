const { Router } = require("express");
const router = Router();

const { verifyUserToken } = require("../../middlewares/authMiddleware.js");
const { createCartItem, getMyCart, sendCartToPrint, createCartCheckoutSession, deleteCartItem } = require("../../controllers/user/cart.js");

router.post("/", verifyUserToken, createCartItem);
router.get("/", verifyUserToken, getMyCart);
router.post("/:id/send", verifyUserToken, sendCartToPrint);
router.post("/:id/checkout", verifyUserToken, createCartCheckoutSession);
router.delete("/:id", verifyUserToken, deleteCartItem);

module.exports = router;
