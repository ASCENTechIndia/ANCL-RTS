const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const controller = require("./Step0.controller");

router.post("/noc-purposes", auth(), controller.getNocPurposes);
router.post("/villages", auth(), controller.getVillages);
router.post("/zones", auth(), controller.getZones);
router.post("/user-mobile", auth(), controller.getUserMobile);
router.post("/hoarding-places", auth(), controller.getHoardingPlaces);
router.post("/hoarding-types", auth(), controller.getHoardingTypes);
router.post("/water-sewerage-types", auth(), controller.getWaterSewerageTypes);
router.post("/prefilled-applicant", auth(), controller.getPrefilledApplicant);
router.post("/birth-search", auth(), controller.searchBirthDetails);
router.post("/death-search", auth(), controller.searchDeathDetails);
router.post("/water-connection-search", auth(), controller.searchWaterConnection);
router.post("/submit-applicant-info", auth(), controller.submitApplicantInfo);
router.post("/submit-bnd-applicant-info", auth(), controller.submitBndApplicantInfo);
router.post("/submit-water-applicant-info", auth(), controller.submitWaterApplicantInfo);
router.post("/submit-imc-application", auth(), controller.submitImcApplication);
router.post("/insert-property-application-details", auth(), controller.insertPropertyApplicationDetails);

module.exports = router;