// const express = require("express");
// const router = express.Router();
// const controller = require("./FrmWaterRegister.controller");
// const auth = require("../../../middlewares/auth.middleware");
// const upload = require("../../../middlewares/upload.middleware");

// router.get("/ward-dropdown", auth(), controller.getWardDropdownController);
// router.get("/service-dropdown", auth(), controller.getServiceDropdownController);
// router.get("/disconnection-dropdown", auth(), controller.getDisconnectionDropdownController);
// router.get("/usage-type-dropdown", auth(), controller.getUsageTypeDropdownController);
// router.get("/connection-size-dropdown", auth(), controller.getConnectionSizeDropdownController);
// router.get("/service-name", auth(), controller.getWaterServiceNameController);
// router.get("/documents", auth(), controller.getWaterDocumentsController);
// router.get("/register-details", auth(), controller.getWaterRegisterDetailsController);
// router.get("/service-pay-flag", auth(), controller.getServicePayFlagController);
// router.post("/save-water-register", auth(), controller.saveWaterRegisterController);
// router.post("/upload-document", auth(), upload.single("file"), controller.uploadWaterDocumentController);
// router.get("/connection-details", auth(), controller.getConnectionDetailsController);
// module.exports = router;

const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth.middleware");
const upload = require("../../../middlewares/upload.middleware");
const controller = require("./FrmWaterRegister.controller");

router.post("/get-ward-list", auth(), controller.getWardList);

router.post("/get-service-list", auth(), controller.getServiceList);

router.post("/get-disconnection-types", auth(), controller.getDisconnectionTypes);

router.post("/get-usage-types", auth(), controller.getUsageTypes);

router.post("/get-connection-sizes", auth(), controller.getConnectionSizes);

router.post("/get-water-register-prefill", auth(), controller.getWaterRegisterPrefill);

router.post("/save-water-register", auth(), controller.saveWaterRegister);

router.post("/insert-karjat-water-register", auth(), controller.moduleInsertKarjatWater);

router.post("/get-block-list", auth(), controller.getBlockList);

router.get("/connection-details", auth(), controller.getConnectionDetailsController);

module.exports = router;
