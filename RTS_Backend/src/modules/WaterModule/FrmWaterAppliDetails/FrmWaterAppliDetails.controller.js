const asyncHandler = require("../../../libs/asyncHandler");
const { fail, ok } = require("../../../libs/response");
const service = require("./FrmWaterAppliDetails.service");

exports.getWardListController = asyncHandler(async (req, res) => {
  console.log("Water Ward List Request:", req.query);
  const { ulbid } = req.query;

  if (!ulbid) {
    return fail(res, "ulbid is required");
  }

  const data = await service.getWardListService({ ulbid });
  return ok(res, data, data.message || "Ward list fetched successfully");
});

exports.getDocumentListController = asyncHandler(async (req, res) => {
  console.log("Water Document List Request:", req.query);
  const { ulbid, serviceId, corpId } = req.query;

  if (!ulbid) {
    return fail(res, "ulbid is required");
  }
  if (!serviceId) {
    return fail(res, "serviceId is required");
  }
  if (!corpId) {
    return fail(res, "corpId is required");
  }

  const data = await service.getDocumentListService({
    ulbid,
    serviceId,
    corpId,
  });
  return ok(res, data, data.message || "Document list fetched successfully");
});

exports.getWaterApplicationDetailsController = asyncHandler(
  async (req, res) => {
    console.log("Water Application Details Request:", req.query);

    const { applicationNo } = req.query;

    if (!applicationNo || !String(applicationNo).trim()) {
      return fail(res, "applicationNo is required");
    }

    const data = await service.getWaterApplicationDetailsService({
      applicationNo,
    });
    return ok(
      res,
      data,
      data.message || "Application details fetched successfully",
    );
  },
);

exports.getWaterApplicationDocumentsController = asyncHandler(
  async (req, res) => {
    console.log("Water Application Documents Request:", req.query);

    const { applicationId } = req.query;

    if (!applicationId) {
      return fail(res, "applicationId is required");
    }

    const data = await service.getWaterApplicationDocumentsService({
      applicationId,
    });
    return ok(
      res,
      data,
      data.message || "Application documents fetched successfully",
    );
  },
);

exports.saveWaterApplicationController = asyncHandler(async (req, res) => {
  console.log("Save Water Application Request:", req.body);
  const {
    userId,
    appDetId,
    ulbid,
    connectionNo,
    appliFName,
    appliMName,
    appliLName,
    mobileNo,
    email,
    aadharNo,
    propertyNo,
    residenceNo,
    currOFName,
    currOMName,
    currOLName,
    currCOFName,
    currCOMName,
    currCOLName,
    newOFName,
    newOMName,
    newOLName,
    newCOFName,
    newCOMName,
    newCOLName,
    docString,
    serviceId,
    zoneId,
    source,
    appliFNameMr,
    appliMNameMr,
    appliLNameMr,
    currOFNameMr,
    currOMNameMr,
    currOLNameMr,
    currCOFNameMr,
    currCOMNameMr,
    currCOLNameMr,
    newOFNameMr,
    newOMNameMr,
    newOLNameMr,
    newCOFNameMr,
    newCOMNameMr,
    newCOLNameMr,
    inStr,
  } = req.body;

  if (!userId) {
    return fail(res, "userId is required");
  }
  if (!ulbid) {
    return fail(res, "ulbid is required");
  }
  if (!connectionNo) {
    return fail(res, "connectionNo is required");
  }
  if (!appliFName) {
    return fail(res, "appliFName is required");
  }
  if (!appliMName) {
    return fail(res, "appliMName is required");
  }
  if (!appliLName) {
    return fail(res, "appliLName is required");
  }
  if (!mobileNo) {
    return fail(res, "mobileNo is required");
  }
  if (!aadharNo) {
    return fail(res, "aadharNo is required");
  }
  if (!newOFName) {
    return fail(res, "newOFName is required");
  }
  if (!newOMName) {
    return fail(res, "newOMName is required");
  }
  if (!newOLName) {
    return fail(res, "newOLName is required");
  }
  if (!serviceId) {
    return fail(res, "serviceId is required");
  }

  const data = await service.saveWaterApplicationService({
    userId,
    appDetId: appDetId || 0,
    ulbid,
    connectionNo,
    appliFName,
    appliMName,
    appliLName,
    mobileNo,
    email,
    aadharNo,
    propertyNo,
    residenceNo,
    currOFName,
    currOMName,
    currOLName,
    currCOFName,
    currCOMName,
    currCOLName,
    newOFName,
    newOMName,
    newOLName,
    newCOFName,
    newCOMName,
    newCOLName,
    docString,
    serviceId,
    zoneId,
    source,
    appliFNameMr,
    appliMNameMr,
    appliLNameMr,
    currOFNameMr,
    currOMNameMr,
    currOLNameMr,
    currCOFNameMr,
    currCOMNameMr,
    currCOLNameMr,
    newOFNameMr,
    newOMNameMr,
    newOLNameMr,
    newCOFNameMr,
    newCOMNameMr,
    newCOLNameMr,
    inStr,
  });

  if (!data.success) {
    return fail(res, data.message || "Unable to save water application");
  }
  return ok(res, data, data.message || "Water application saved successfully");
});

exports.uploadWaterApplicationDocumentController = asyncHandler(
  async (req, res) => {
    console.log("Upload Water Application Document:", req.body);
    const { corpId, serviceId, applicationNo, documentType, documentId } =
      req.body;

    if (!corpId) {
      return fail(res, "corpId is required");
    }
    if (!serviceId) {
      return fail(res, "serviceId is required");
    }
    if (!applicationNo || !String(applicationNo).trim()) {
      return fail(res, "applicationNo is required");
    }
    if (!documentType || !String(documentType).trim()) {
      return fail(res, "documentType is required");
    }
    if (!documentId) {
      return fail(res, "documentId is required");
    }
    if (!req.file) {
      return fail(res, "file is required");
    }

    const data = await service.uploadWaterApplicationDocumentService({
      corpId,
      serviceId,
      applicationNo,
      documentType,
      documentId,
      fileBuffer: req.file.buffer,
    });

    if (!data.success) {
      return fail(res, data.message || "Unable to upload application document");
    }

    return ok(
      res,
      data,
      data.message || "Application document uploaded successfully",
    );
  },
);
