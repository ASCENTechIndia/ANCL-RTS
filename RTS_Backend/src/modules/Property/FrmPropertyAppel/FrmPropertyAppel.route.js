const express = require("express");
const controller = require("./FrmPropertyAppel.controller");
const auth = require("../../../middlewares/auth.middleware");

const router = express.Router();

router.get("/wards", auth(), controller.getWards);
router.get("/usage-types", auth(), controller.getUsageTypes);
router.get("/objections", auth(), controller.getObjections);
router.get("/usage-sub-types", auth(), controller.getUsageSubTypes);
router.post("/property-details", auth(), controller.getPropertyDetails)

router.post("/prop-appeal", auth(), controller.createPropAppeal);

module.exports = router;