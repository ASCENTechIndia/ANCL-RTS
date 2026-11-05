const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./FrmNewTaxRecoveryReg.controller");

// 1. Ward / Zone List
router.post("/ward-list", controller.getWardList);

// 2. Usage Type
router.post("/usage-type-list", controller.getUsageTypeList);

// 3. Construction Type
router.post("/construction-type-list", controller.getConstructionTypeList);

// 4. User Mobile Number
router.post("/user-mobile-number", controller.getUserMobileNumber);

// 5. Water Sewerage Type
router.post("/water-sewerage-type-list", controller.getWaterSewerageTypeList);

// 6. NOC Purpose
router.post("/noc-purpose-list", controller.getNOCPurposeList);

router.post("/prefilled-applicant-details", controller.getPrefilledApplicantDetails);

router.post("/insert-new-tax-application", controller.insertNewTaxApplication);

router.post("/insert-karjat-module", controller.insertKarjatModule);

router.post("/get-corporation-code", controller.getCorporationCode);

router.post("/get-amc-no-dues-details", controller.getAMCNoDuesDetails);

router.post("/search-bnd-records",  controller.searchBNDRecords);

module.exports = router;
