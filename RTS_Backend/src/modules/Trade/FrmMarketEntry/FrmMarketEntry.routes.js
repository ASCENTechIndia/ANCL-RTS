const express = require("express");
const controller = require("./FrmMarketEntry.controller");
const router = express.Router();
const auth = require("../../../middlewares/auth.middleware");
const upload = require("../../../middlewares/upload.middleware");

// GET BUSINESS PLACE
router.post("/getbusinessplace",auth(), controller.getBusinessPlace);

// GET JALAN SHIL
router.post("/getjalanshil", auth(), controller.getJalanShil);

// GET ILLEGAL TYPE
router.post("/getillegaltype", auth(), controller.getIllegalType);

// GET APPLICANT TYPE
router.post("/getapplicanttype", auth(), controller.getApplicantType);

// GET WARD
router.post("/getward", auth(), controller.getWard);

// GET ZONE BY WARD (NEW - Mirroring ddlward_SelectedIndexChanged)
router.post("/getzonebyward", auth(), controller.getZoneByWard);

// GET LICENSE TYPE
router.post("/getlicensetype", auth(), controller.getLicenseType);

// GET TRADE CATEGORY
router.post("/gettradecategory",  controller.getTradeCategory);

// GET TRADE DETAILS
router.post("/gettradedetails", auth(), controller.getTradeDetails);

// GET DOCUMENT DETAILS
router.post("/getdocumentdetails", auth(), controller.getDocumentDetails);

// GET SELF DECLARE DATA
router.post("/getselfdeclaredata", auth(),   controller.getSelfDeclareData);

// GET APPLICATION DETAILS
router.post("/getapplicationdetails", auth(), controller.getApplicationDetails);

// GET EXISTING LICENSE DETAILS (NEW - Mirroring FetchExiatingLicDetails)
router.post("/getexistinglicensedetails", auth(), controller.getExistingLicenseDetails);

// CHECK LICENSE CANCELLED (NEW - Mirroring btnSearch_Click)
router.post("/checklicensecancelled", auth(), controller.checkLicenseCancelled);

// APPLICATION ENTRY
router.post("/applicationentry", auth(), controller.applicationEntry);

// UPDATE DIRECTOR IMAGES
router.post("/updatedirectorimages", auth(), upload.array("directorImages", 10), controller.updateDirectorImages);

// DOCUMENT INSERT
router.post("/documentinsert",auth(), upload.single("document"), controller.documentInsert);

// GET TRADE CATEGORY BY JWALAN
router.post("/gettradecategorybyjwalanshil", auth(), controller.getTradeCategoryByJwalan);

module.exports = router;