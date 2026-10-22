const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");

const service = require("./FrmMarketLicenseupdt.service");

exports.getApplicationTypes = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getApplicationTypesService({
    ulbId,
  });

  return ok(res, result, "Application types fetched successfully");
});

exports.getZones = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getZonesService({
    ulbId,
  });

  return ok(res, result, "Zones fetched successfully");
});

exports.getGenders = asyncHandler(async (req, res) => {
  const result = await service.getGendersService();

  return ok(res, result, "Genders fetched successfully");
});

exports.getJalanshil = asyncHandler(async (req, res) => {
  const result = await service.getJalanshilService();

  return ok(res, result, "Jalanshil data fetched successfully");
});

exports.getRelations = asyncHandler(async (req, res) => {
  const result = await service.getRelationsService();

  return ok(res, result, "Relations fetched successfully");
});

exports.getDocuments = asyncHandler(async (req, res) => {
  const { serviceId, ulbId } = req.body;

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getDocumentsService({
    serviceId,
    ulbId,
  });

  return ok(res, result, "Documents fetched successfully");
});

exports.getLicenseTypes = asyncHandler(async (req, res) => {
  const result = await service.getLicenseTypesService();

  return ok(res, result, "License types fetched successfully");
});

exports.getAdhikrtutta = asyncHandler(async (req, res) => {
  const result = await service.getAdhikrtuttaService();

  return ok(res, result, "Adhikrtutta data fetched successfully");
});

exports.getApplicationStatus = asyncHandler(async (req, res) => {
  const result = await service.getApplicationStatusService();

  return ok(res, result, "Application status fetched successfully");
});

exports.getMarketLicenseDetails = asyncHandler(async (req, res) => {
  const { licenseNo, ulbId } = req.body;

  if (!licenseNo) {
    return fail(res, "License Number is required");
  }

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getMarketLicenseDetailsService({
    licenseNo,
    ulbId,
  });

  return ok(res, result, "Market license details fetched successfully");
});

exports.getDirectorName = asyncHandler(async (req, res) => {
  const { appliType, ulbId } = req.body;

  if (!appliType) {
    return fail(res, "Application Type is required");
  }

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getDirectorNameService({
    appliType,
    ulbId,
  });

  return ok(res, result, "Director name fetched successfully");
});

exports.getMarketApplicationTypes = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getMarketApplicationTypesService({
    ulbId,
  });

  return ok(res, result, "Market application types fetched successfully");
});

exports.getDirectorDetails = asyncHandler(async (req, res) => {
  const { appliId, ulbId } = req.body;

  if (!appliId) {
    return fail(res, "Application ID is required");
  }

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getDirectorDetailsService({
    appliId,
    ulbId,
  });

  return ok(res, result, "Director details fetched successfully");
});

exports.getMarketApplicationAddress = asyncHandler(async (req, res) => {
  const { licenseNo, ulbId } = req.body;

  if (!licenseNo) {
    return fail(res, "License Number is required");
  }

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getMarketApplicationAddressService({
    licenseNo,
    ulbId,
  });

  return ok(res, result, "Application address fetched successfully");
});

exports.getTradeTypeDetails = asyncHandler(async (req, res) => {
  const { appliId, ulbId } = req.body;

  if (!appliId) {
    return fail(res, "Application ID is required");
  }

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getTradeTypeDetailsService({
    appliId,
    ulbId,
  });

  return ok(res, result, "Trade type details fetched successfully");
});

exports.getTradeDetails = asyncHandler(async (req, res) => {
  const { appliId } = req.body;

  if (!appliId) {
    return fail(res, "Application ID is required");
  }

  const result = await service.getTradeDetailsService({
    appliId,
  });

  return ok(res, result, "Trade details fetched successfully");
});

exports.getTradeDirectorId = asyncHandler(async (req, res) => {
  const { applicationId } = req.body;

  if (!applicationId) {
    return fail(res, "Application ID is required");
  }

  const result = await service.getTradeDirectorIdService({
    applicationId,
  });

  return ok(res, result, "Trade director ID fetched successfully");
});

exports.updateTradeDirectorImage = asyncHandler(async (req, res) => {
  const { directorId, applicationId } = req.body;

  if (!directorId) {
    return fail(res, "Director ID is required");
  }

  if (!applicationId) {
    return fail(res, "Application ID is required");
  }

  const fileBuffer = req.file?.buffer;

  if (!fileBuffer) {
    return fail(res, "Director image is required");
  }

  const result = await service.updateTradeDirectorImageService({
    directorId,
    applicationId,
    fileBuffer,
  });

  if (!result.success) {
    return fail(res, result.message || "Director image update failed");
  }

  return ok(res, result, "Director image updated successfully");
});

exports.getTradeTypesByCategory = asyncHandler(async (req, res) => {
  const { categoryId, categoryType } = req.body;

  if (!categoryId) {
    return fail(res, "Category ID is required");
  }

  if (!categoryType) {
    return fail(res, "categoryType is required");
  }

  const result = await service.getTradeTypesByCategoryService({ categoryId, categoryType });
  return ok(res, result, "Trade types fetched successfully");
});

exports.getServiceInstructions = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  const result = await service.getServiceInstructionsService({
    serviceId,
  });

  return ok(res, result, "Service instructions fetched successfully");
});

exports.getTradeCategories = asyncHandler(async (req, res) => {
  const { jwalanshilstat , categoryType } = req.body;

  const result = await service.getTradeCategoriesService({
    jwalanshilstat, categoryType
  });

  return ok(res, result, "Trade categories fetched successfully");
});

exports.getSelfDeclaration = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  const result = await service.getSelfDeclarationService({
    serviceId,
  });

  return ok(res, result, "Self declaration fetched successfully");
});

exports.submitTradeApplication = asyncHandler(async (req, res) => {
  const {
    userid,
    userId,

    licenseno,
    appfname,
    appmname,
    applname,
    mobile,
    email,
    aadhar,
    propno,
    address,
    remark,

    newbusiname,
    newownfname,
    newownmname,
    newownlname,

    newcofname,
    newcomname,
    newcolname,

    ulbid,
    servicename,

    businesstr,
    partnerstr,
    corrpartnerstr,

    appid,
    tradeaddrstr,
    tradechkstr,
    directorstr,

    rate,
    wardid,
    zoneid,
    // Servid,
    Source,
    // amount,

    // Gender,
    // Jwalan,
    // Relation,
    // Adhikrutta,
    // LicencType,
    // TradeType,

    // CloseDt,
    // LicOwner,
    // LicType,
    // LicFrmDt,
    // LicToDt,

    // BusiName,
    // BusiSwarup,
    // BusiAddr,
    // type,
  } = req.body;

  const finalUserId = req.user?.userId || userid || userId;

  if (!ulbid) {
    return fail(res, "ULB ID is required");
  }

  if (!licenseno) {
    return fail(res, "License Number is required");
  }

  if (!mobile) {
    return fail(res, "Mobile Number is required");
  }

  if (String(mobile).length !== 10) {
    return fail(res, "Mobile Number must be 10 digits");
  }

  const result = await service.submitTradeApplicationService({
    userid: finalUserId,

    licenseno,
    appfname,
    appmname,
    applname,
    mobile,
    email,
    aadhar,
    propno,
    address,
    remark,

    newbusiname,
    newownfname,
    newownmname,
    newownlname,

    newcofname,
    newcomname,
    newcolname,

    ulbid,
    servicename,

    businesstr,
    partnerstr,
    corrpartnerstr,

    appid,
    tradeaddrstr,
    tradechkstr,
    directorstr,

    rate,
    wardid,
    zoneid,
    // Servid,
    Source,
    // amount,

    // Gender,
    // Jwalan,
    // Relation,
    // Adhikrutta,
    // LicencType,
    // TradeType,

    // CloseDt,
    // LicOwner,
    // LicType,
    // LicFrmDt,
    // LicToDt,

    // BusiName,
    // BusiSwarup,
    // BusiAddr,
    // type,
  });

  if (!result.success) {
    return fail(res, result.message || "Trade application submission failed");
  }

  return ok(
    res,
    result,
    result.message || "Trade application submitted successfully",
  );
});

exports.insertTradeTypeLog = asyncHandler(async (req, res) => {
  const {
    orgId,
    id,
    appId,
    tradeType,
    tradeCat,
    rate,
    directorId,
    aadharNo,
    directorName,
    mobileNo,
    email,
    gender,
    address,
    appliType,
    servicee,
  } = req.body;

  if (!orgId) {
    return fail(res, "Organization/ULB ID is required");
  }

  if (!service) {
    return fail(res, "Service is required");
  }

  const result = await service.insertTradeTypeLogService({
    orgId,
    id,
    appId,
    tradeType,
    tradeCat,
    rate,
    directorId,
    aadharNo,
    directorName,
    mobileNo,
    email,
    gender,
    address,
    appliType,
    servicee,
  });

  if (!result.success) {
    return fail(res, result.message || "Trade type log insertion failed");
  }

  return ok(
    res,
    result,
    result.message || "Trade type log inserted successfully",
  );
});
