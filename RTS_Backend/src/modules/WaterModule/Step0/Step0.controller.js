const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./Step0.service");

exports.getNocPurposes = asyncHandler(async (req, res) => {
  const result = await service.getNocPurposesService();
  return ok(res, result, "NOC purposes fetched successfully");
});

exports.getVillages = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;
  if (!ulbId) return fail(res, "ulbId is required");

  const result = await service.getVillagesService(ulbId);
  return ok(res, result, "Villages fetched successfully");
});

exports.getZones = asyncHandler(async (req, res) => {
  const { ulbId, serviceId } = req.body;
  if (!ulbId) return fail(res, "ulbId is required");

  const result = await service.getZonesService(ulbId, serviceId);
  return ok(res, result, "Zones fetched successfully");
});

exports.getUserMobile = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.body.userId;
  const ulbId = req.user?.ulbId || req.body.ulbId;

  if (!userId || !ulbId) {
    return fail(res, "userId and ulbId are required");
  }

  const result = await service.getUserMobileService(userId, ulbId);
  return ok(res, result, "User mobile fetched successfully");
});

exports.getHoardingPlaces = asyncHandler(async (req, res) => {
  const result = await service.getHoardingPlacesService();
  return ok(res, result, "Hoarding places fetched successfully");
});

exports.getHoardingTypes = asyncHandler(async (req, res) => {
  const result = await service.getHoardingTypesService();
  return ok(res, result, "Hoarding types fetched successfully");
});

exports.getWaterSewerageTypes = asyncHandler(async (req, res) => {
  const result = await service.getWaterSewerageTypesService();
  return ok(res, result, "Water sewerage types fetched successfully");
});

exports.getPrefilledApplicant = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    userId: req.user?.userId || req.body.userId,
    ulbId: req.user?.ulbId || req.body.ulbId,
    corpId: req.user?.corpId || req.body.corpId,
  };

  const required = ["corpId", "serviceId", "userId", "ulbId"];

  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      return fail(res, `${key} is required`);
    }
  }

  const result = await service.getPrefilledApplicantService(payload);
  return ok(res, result, "Applicant details fetched successfully");
});

exports.searchBirthDetails = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ulbId: req.user?.ulbId || req.body.ulbId,
  };

  if (!payload.ulbId) return fail(res, "ulbId is required");

  const result = await service.searchBirthDetailsService(payload);
  return ok(res, result, "Birth details fetched successfully");
});

exports.searchDeathDetails = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    ulbId: req.user?.ulbId || req.body.ulbId,
  };

  if (!payload.ulbId) return fail(res, "ulbId is required");

  const result = await service.searchDeathDetailsService(payload);
  return ok(res, result, "Death details fetched successfully");
});

exports.searchWaterConnection = asyncHandler(async (req, res) => {
  const connectionNo = req.body.connectionNo;
  const ulbId = req.user?.ulbId || req.body.ulbId;

  if (!connectionNo || !ulbId) {
    return fail(res, "connectionNo and ulbId are required");
  }

  const result = await service.searchWaterConnectionService(connectionNo, ulbId);
  return ok(res, result, "Water connection details fetched successfully");
});

exports.submitApplicantInfo = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    userId: req.user?.userId || req.body.userId,
    ulbId: req.user?.ulbId || req.body.ulbId,
    corpId: req.user?.corpId || req.body.corpId,
  };

  const required = ["ulbId", "corpId", "serviceId", "userId", "mode"];

  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      return fail(res, `${key} is required`);
    }
  }

  const result = await service.submitApplicantInfoService(payload);

  if (!result?.success) {
    return fail(res, result?.error || "Applicant information procedure failed");
  }

  const outBinds = result.outBinds || result.outbinds || {};
  const errorCode = Number(outBinds.out_errcode);
  const message = outBinds.out_ErrMsg || "Applicant information procedure completed";

  if (errorCode !== 9999) return fail(res, message);

  return ok(
    res,
    {
      success: true,
      errorCode,
      message,
      applicationNo: outBinds.out_AppNo || null,
    },
    message
  );
});

exports.submitBndApplicantInfo = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    userId: req.user?.userId || req.body.userId,
    ulbId: req.user?.ulbId || req.body.ulbId,
    corpId: req.user?.corpId || req.body.corpId,
  };

  const required = ["ulbId", "corpId", "serviceId", "userId", "mode"];

  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      return fail(res, `${key} is required`);
    }
  }

  const result = await service.submitBndApplicantInfoService(payload);

  if (!result?.success) {
    return fail(res, result?.error || "Birth/Death applicant procedure failed");
  }

  const outBinds = result.outBinds || result.outbinds || {};
  const errorCode = Number(outBinds.out_errcode);
  const message = outBinds.out_ErrMsg || "Birth/Death applicant procedure completed";

  if (errorCode !== 9999) return fail(res, message);

  return ok(
    res,
    {
      success: true,
      errorCode,
      message,
      applicationNo: outBinds.out_AppNo || null,
    },
    message
  );
});

exports.submitWaterApplicantInfo = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    userId: req.user?.userId || req.body.userId,
    ulbId: req.user?.ulbId || req.body.ulbId,
    corpId: req.user?.corpId || req.body.corpId,
  };

  const required = ["ulbId", "corpId", "serviceId", "userId", "mode"];

  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      return fail(res, `${key} is required`);
    }
  }

  const result = await service.submitWaterApplicantInfoService(payload);

  if (!result?.success) {
    return fail(res, result?.error || "Water applicant procedure failed");
  }

  const outBinds = result.outBinds || result.outbinds || {};
  const errorCode = Number(outBinds.out_errcode);
  const message = outBinds.out_ErrMsg || "Water applicant procedure completed";

  if (errorCode !== 9999) return fail(res, message);

  return ok(
    res,
    {
      success: true,
      errorCode,
      message,
      applicationNo: outBinds.out_AppNo || null,
    },
    message
  );
});

exports.submitImcApplication = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    userId: req.user?.userId || req.body.userId,
  };

  const required = ["userId", "serviceId", "orgId", "applicationNo", "mode"];

  for (const key of required) {
    if (payload[key] === undefined || payload[key] === null || payload[key] === "") {
      return fail(res, `${key} is required`);
    }
  }

  const result = await service.submitImcApplicationService(payload);

  if (!result?.success) {
    return fail(res, result?.error || "IMC application procedure failed");
  }

  const outBinds = result.outBinds || result.outbinds || {};
  const errorCode = Number(outBinds.Out_Errorcode);
  const message = outBinds.Out_Errormsg || "IMC application procedure completed";

  if (errorCode !== 9999) return fail(res, message);

  return ok(res, { success: true, errorCode, message }, message);
});

exports.insertPropertyApplicationDetails = asyncHandler(async (req, res) => {
  const { appliFlag, appliData } = req.body;

  const userId = req.user?.userId || req.body.userId;

  if (!userId || !appliFlag || !appliData) {
    return res.status(400).json({
      ok: false,
      message: "UserId, appliFlag and appliData are required",
    });
  }

  const result = await service.insertPropertyApplicationDetailsService({
    userId,
    appliFlag,
    appliData,
  });

  if (!result?.success) {
    return res.status(400).json({
      ok: false,
      message: result?.error || "Property application procedure failed",
      data: result,
    });
  }

  const outBinds = result.outBinds || result.outbinds || {};
  const errorCode = outBinds.out_ErrorCode ?? outBinds.OUT_ERRORCODE ?? outBinds.out_errorcode;
  const errorMessage = outBinds.out_ErrorMsg ?? outBinds.OUT_ERRORMSG ?? outBinds.out_errormsg;
  const outputString = outBinds.out_str ?? outBinds.OUT_STR ?? outBinds.OUT_STR;

  if (Number(errorCode) !== 9999) {
    return res.status(400).json({
      ok: false,
      message: errorMessage || "Property application insertion failed",
      errorCode,
      out_str: outputString,
    });
  }

  return res.status(200).json({
    ok: true,
    message: errorMessage || "Property application submitted successfully",
    data: {
      errorCode,
      applicationNo: outputString,
      out_str: outputString,
    },
  });
});