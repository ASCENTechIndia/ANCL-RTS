const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmWaterAppliEntry.service");

exports.getZones = asyncHandler(async (req, res) => {
  const { ulbId } = req.body;

  if (!ulbId) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getZonesService(ulbId);
  return ok(res, result, "Zones fetched successfully");
});

exports.getConnectionTypes = asyncHandler(async (req, res) => {
  const result = await service.getConnectionTypesService();
  return ok(res, result, "Connection types fetched successfully");
});

exports.getConnectionSizes = asyncHandler(async (req, res) => {
  const result = await service.getConnectionSizesService();
  return ok(res, result, "Connection sizes fetched successfully");
});

exports.getUsageTypes = asyncHandler(async (req, res) => {
  const result = await service.getUsageTypesService();
  return ok(res, result, "Usage types fetched successfully");
});

exports.getUsageSubTypes = asyncHandler(async (req, res) => {
  const { usageTypeId } = req.body;

  if (!usageTypeId) {
    return fail(res, "Usage Type ID is required");
  }

  const result = await service.getUsageSubTypesService(usageTypeId);
  return ok(res, result, "Usage sub-types fetched successfully");
});

exports.getConnectionStatuses = asyncHandler(async (req, res) => {
  const result = await service.getConnectionStatusesService();
  return ok(res, result, "Connection statuses fetched successfully");
});

exports.getBusinessCertificates = asyncHandler(async (req, res) => {
  const result = await service.getBusinessCertificatesService();
  return ok(res, result, "Business certificates fetched successfully");
});

exports.getDocumentDefinitions = asyncHandler(async (req, res) => {
  const { corpId, serviceId, ulbId } = req.body;

  if (!corpId) return fail(res, "Corp ID is required");
  if (!serviceId) return fail(res, "Service ID is required");
  if (!ulbId) return fail(res, "ULB ID is required");

  const result = await service.getDocumentDefinitionsService({
    corpId,
    serviceId,
    ulbId,
  });

  return ok(res, result, "Document definitions fetched successfully");
});

exports.getServicePaymentFlag = asyncHandler(async (req, res) => {
  const { serviceId } = req.body;

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  const result = await service.getServicePaymentFlagService(serviceId);
  return ok(res, result, "Service payment flag fetched successfully");
});

exports.getApplicationDetails = asyncHandler(async (req, res) => {
  const { applicationNo } = req.body;

  if (!applicationNo) {
    return fail(res, "Application Number is required");
  }

  const result = await service.getApplicationDetailsService(applicationNo);
  
  return ok(res, result, "Application details fetched successfully");
});

exports.uploadDocument = asyncHandler(async (req, res) => {
  const { corpId, serviceId, appNo, docType, documentId } = req.body;
  const fileBuffer = req.file?.buffer;

  if (!corpId) return fail(res, "Corp ID is required");
  if (!serviceId) return fail(res, "Service ID is required");
  if (!appNo) return fail(res, "Application Number is required");
  if (!docType) return fail(res, "Document Type is required");
  if (!documentId) return fail(res, "Document ID is required");
  if (!fileBuffer) return fail(res, "Document file is required");

  const result = await service.uploadDocumentService({
    corpId,
    serviceId,
    appNo,
    docType,
    documentId,
    fileBuffer,
  });

  if (!result.success) {
    return fail(res, result.message || "Document upload failed");
  }

  return ok(res, result, "Document uploaded successfully");
});

exports.submitApplication = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.body.userId;
  const ulbId = req.user?.ulbId || req.body.ulbId;
  const corpId = req.user?.corpId || req.body.corpId;
  const serviceId = req.body.serviceId;

  if (!ulbId) return fail(res, "ULB ID is required");
  if (!userId) return fail(res, "User ID is required");
  if (!corpId) return fail(res, "Corp ID is required");
  if (!serviceId) return fail(res, "Service ID is required");

  const payload = {
    ulbId,
    corpId,
    userId,
    serviceId,
    zoneId: req.body.zoneId,
    appSource: req.body.appSource || "",
    afName: req.body.afName,
    amName: req.body.amName,
    alName: req.body.alName,
    mobileNo: req.body.mobileNo,
    email: req.body.email,
    aadharNo: req.body.aadharNo,
    propNo: req.body.propNo,
    resNo: req.body.resNo,
    address: req.body.address,
    afNameMr: req.body.afNameMr,
    amNameMr: req.body.amNameMr,
    alNameMr: req.body.alNameMr,
    addressMr: req.body.addressMr,
    conFName: req.body.conFName,
    conMName: req.body.conMName,
    conLName: req.body.conLName,
    conMobNo: req.body.conMobNo,
    conEmail: req.body.conEmail,
    conAadharNo: req.body.conAadharNo,
    conPropNo: req.body.conPropNo,
    conResNo: req.body.conResNo,
    conFNameMr: req.body.conFNameMr,
    conMNameMr: req.body.conMNameMr,
    conLNameMr: req.body.conLNameMr,
    cooFlag: req.body.cooFlag,
    cooFName1: req.body.cooFName1,
    cooMName1: req.body.cooMName1,
    cooLName1: req.body.cooLName1,
    cooFName2: req.body.cooFName2,
    cooMName2: req.body.cooMName2,
    cooLName2: req.body.cooLName2,
    cooAddress: req.body.cooAddress,
    cooAddressMr: req.body.cooAddressMr,
    connType: req.body.connType,
    connSize: req.body.connSize,
    usageType: req.body.usageType,
    usageSubType: req.body.usageSubType,
    noOfPerson: req.body.noOfPerson,
    noOfFamily: req.body.noOfFamily,
    noOfConn: req.body.noOfConn,
    connStatus: req.body.connStatus,
    busiCert: req.body.busiCert,
    billingType: req.body.billingType,
    govPropFlag: req.body.govPropFlag,
    remark: req.body.remark,
    reason: req.body.reason,
    documents: req.body.documents || [],
  };

  const result = await service.submitWaterApplicationService(payload);

  if (!result.success) {
    return fail(res, result.message || "Application submission failed");
  }

  return ok(res, result, result.message || "Application submitted successfully");
});

exports.checkPayment = asyncHandler(async (req, res) => {
  const { serviceId, applicationNo } = req.body;

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  const result = await service.checkPaymentService(serviceId, applicationNo);

  return ok(
    res,
    {
      payFlag: result.payFlag,
      applicationNo: applicationNo,
    },
    "Payment check completed"
  );
});

exports.submitRTSAppliDetails = asyncHandler(async (req, res) => {
  const payload = {
    userId: req.user?.userId || req.body.userId,
    appliFlag: req.body.appliFlag,
    appliData: req.body.appliData,
    appliDtlsData: req.body.appliDtlsData,
  };

  if (!payload.userId) return fail(res, "User ID is required");

  const result = await service.submitRTSAppliDetailsService(payload);

  if (!result.success) {
    return fail(res, result.message || "RTS Application submission failed");
  }

  return ok(res, result, "RTS Application submitted successfully");
});

exports.submitKarjatWaterApplication = asyncHandler(async (req, res) => {
  const userId = req.user?.userId || req.body.userId;

  if (!userId) {
    return fail(res, "User ID is required");
  }

  const result = await service.submitKarjatWaterApplicationService({
    userId,
    appliFlag: req.body.appliFlag,
    appliData: req.body.appliData,
    appliDtlsData: req.body.appliDtlsData,
  });

  if (!result.success) {
    return fail(res, result.message || "Karjat module entry failed");
  }

  return ok(res, result, result.message);
});
