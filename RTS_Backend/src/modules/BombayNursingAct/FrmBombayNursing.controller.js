const asyncHandler = require("../../libs/asyncHandler");
const { fail, ok } = require("../../libs/response");
const service = require("./FrmBombayNursing.service");

exports.getServiceListController = asyncHandler(async (req, res) => {
  console.log("Bombay Nursing Service List Request:", req.body);

  const { ulbID, ulbid } = req.body;

  if (!ulbID && !ulbid) {
    return fail(res, "ulbID is required");
  }

  const data = await service.getServiceListService({
    ulbID: ulbID || ulbid,
  });

  if (!data.success) {
    return fail(res, data.message);
  }

  return ok(res, data, "Bombay Nursing service list fetched successfully");
});

exports.getWardListController = asyncHandler(async (req, res) => {
  console.log("Bombay Nursing Ward List Request:", req.body);

  const { ulbID } = req.body;

  if (!ulbID) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getWardListService({ ulbID });

  if (!result.success) {
    return fail(res, result.message);
  }

  return ok(res, result.data, "Ward List fetched successfully");
});

exports.insertNursingController = asyncHandler(async (req, res) => {
  console.log("Bombay Nursing Application Request:", req.body);

  const { userId, ulbID, servId, appliFName, appliMName, appliLName, appliMobNo, appliEmailId, appliAadNo, appliPropNo, appliResNo, instName, instAddr, zoneId, hospName, hospMob, hosEmail, ptaxno, wtTaxno, firenoc, nocDoc, address, appSource } = req.body;

  const finalUserId = req.user?.userId || userId;

  if (!finalUserId) {
    return fail(res, "User ID is required");
  }

  const result = await service.insertNursingService({
    userId: finalUserId,
    ulbID,
    servId,
    appliFName,
    appliMName,
    appliLName,
    appliMobNo,
    appliEmailId,
    appliAadNo,
    appliPropNo,
    appliResNo,
    instName,
    instAddr,
    zoneId,
    hospName,
    hospMob,
    hosEmail,
    ptaxno,
    wtTaxno,
    firenoc,
    nocDoc,
    address,
    appSource,
  });

  if (!result.success) {
    return fail(res, result.message || "Nursing Application submission failed");
  }

  return ok(
    res,
    {
      appNo: result.appNo,
      errorCode: result.errorCode,
    },
    result.message || "Nursing Application submitted successfully",
  );
});
