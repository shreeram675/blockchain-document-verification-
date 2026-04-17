const express = require("express");
const router = express.Router();
const controller = require("../controllers/documentController");
const { protect, authorize } = require("../middlewares/authMiddleware");
const multer = require("multer");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

// Ensure uploads dir exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ✅ Working routes only
router.post(
  "/upload",
  protect,
  authorize("uploader"),
  upload.single("document"),
  controller.uploadDocument,
);
router.post("/verify", upload.single("document"), controller.verifyDocument);

module.exports = router;
