const express = require("express");
const router = express.Router();
const controller = require("./FrmPlumberLicense.controller");
const auth = require("../../../middlewares/auth.middleware");

router.get("/education-dropdown",  controller.getEducationDropdownController);
router.post("/save-plumber-license", auth(), controller.savePlumberLicenseController);
router.post("/renew-plumber-license", auth(), controller.renewPlumberLicenseController);

module.exports = router;