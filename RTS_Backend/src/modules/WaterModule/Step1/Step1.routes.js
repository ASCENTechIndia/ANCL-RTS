const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const upload = require("../../../middlewares/upload.middleware");
const controller = require("./Step1.controller");

router.post(
  "/upload-document",
  auth(),
  upload.single("document"),
  controller.uploadDocument
);

router.post(
  "/application-ins",
  auth(),
  controller.callApplicationIns
);

module.exports = router;