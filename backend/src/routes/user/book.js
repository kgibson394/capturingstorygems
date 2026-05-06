const { Router } = require("express");
const router = Router();

const {
  createBook,
   getMyBooks,
  getBook,
  addStoryToBook,
  removeStoryFromBook,
  reorderBookItems,
  deleteBook,
  generateBookPdf,
  sendToLulu,
  calculatePrintCost,
  validateInteriorPdf,
  updateBookTitle,
  getInteriorValidationStatus,
  getCoverValidationStatus,
  validateCoverPdf
} = require("../../controllers/user/book.js");

const { verifyUserToken } = require("../../middlewares/authMiddleware.js");
// optional if you want to block public users:
// const { blockPublicUsers } = require("../../middlewares/blockPublicUsers.js");

router.post("/", verifyUserToken, createBook);
router.get("/", verifyUserToken, getMyBooks);
router.get("/:bookId", verifyUserToken, getBook);
router.post("/:bookId/items", verifyUserToken, addStoryToBook);
router.delete("/:bookId/items/:storyId", verifyUserToken, removeStoryFromBook);
router.put("/:bookId/reorder", verifyUserToken, reorderBookItems);
router.put("/:bookId", verifyUserToken, updateBookTitle);
router.delete("/:bookId", verifyUserToken, deleteBook);
router.post("/:bookId/generate-pdf", verifyUserToken, generateBookPdf);
router.post("/:bookId/send-to-lulu", verifyUserToken, sendToLulu);
router.post("/:bookId/cost-estimate", verifyUserToken, calculatePrintCost);
router.post("/:bookId/validate-interior", verifyUserToken, validateInteriorPdf);
router.get("/:bookId/validate-interior/:validationId", verifyUserToken, getInteriorValidationStatus);
router.post("/:bookId/validate-cover", verifyUserToken, validateCoverPdf);
router.get("/:bookId/validate-cover/:validationId", verifyUserToken, getCoverValidationStatus);

module.exports = router;