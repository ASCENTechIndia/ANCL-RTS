const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const upload = require("../../../middlewares/upload.middleware");
const controller = require("./Step1.controller");

// ONE unified document upload endpoint (conditional inserts inside)
router.post(
  "/upload-document",
  
  upload.single("document"),
  controller.uploadDocument
);

// Procedure stays separate
router.post(
  "/application-ins",
  
  controller.callApplicationIns
);

module.exports = router;