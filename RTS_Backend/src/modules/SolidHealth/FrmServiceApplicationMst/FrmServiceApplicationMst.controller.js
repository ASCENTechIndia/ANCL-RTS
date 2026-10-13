const asyncHandler = require("../../../libs/asyncHandler");
const { ok } = require("../../../libs/response");
const { AppError } = require("../../../libs/errors");
const path = require("path");


const service = require("./FrmServiceApplicationMst.service");

// ============================================================
// GET WARD LIST
// ============================================================
const getWardList = asyncHandler(async (req, res) => {
  console.log("Request: Get Ward List");
  console.log("Request Body:", req.body);

  const { ulbId } = req.body;

  if (!ulbId) {
    throw new AppError("ULB ID is required.", 400);
  }

  const result = await service.getWardListService(ulbId);

  return ok(res, {
    message: "Ward list fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// GET SECTOR LIST
// ============================================================
const getSectorList = asyncHandler(async (req, res) => {
  console.log("Request: Get Sector List");
  console.log("Request Body:", req.body);

  const { serviceId } = req.body;

  if (!serviceId) {
    throw new AppError("Service ID is required.", 400);
  }

  const result = await service.getSectorListService(serviceId);

  return ok(res, {
    message: "Sector list fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// GET DOCUMENT LIST
// ============================================================
const getDocumentList = asyncHandler(async (req, res) => {
  console.log("Request: Get Document List");
  console.log("Request Body:", req.body);

  const { serviceId, ulbId } = req.body;

  if (!serviceId) {
    throw new AppError("Service ID is required.", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required.", 400);
  }

  const result = await service.getDocumentListService(serviceId, ulbId);

  return ok(res, {
    message: "Document list fetched successfully.",
    data: result.data,
  });
});

// ============================================================
// SAVE SERVICE APPLICATION
// ============================================================
const saveServiceApplication = asyncHandler(async (req, res) => {
  const { ulbId, userId, serviceId, applicationName, address, mobile, email, aadharNo, refNo, zoneId, sectorId, villageId, locality, landmark, pincode, source } = req.body;

  if (!ulbId) {
    throw new AppError("ulbId is required", 400);
  }

  if (!userId) {
    throw new AppError("userId is required", 400);
  }

  if (!serviceId) {
    throw new AppError("serviceId is required", 400);
  }

  if (!applicationName || !applicationName.trim()) {
    throw new AppError("Application Name is required", 400);
  }

  if (!mobile) {
    throw new AppError("Mobile No is required", 400);
  }

  if (!/^\d{10}$/.test(String(mobile))) {
    throw new AppError("Invalid Mobile No", 400);
  }

  if (!email || !email.trim()) {
    throw new AppError("Email ID is required", 400);
  }

  //const emailRegex = /^[\w.-]+@[\w-]+(\.[\w-]+)+$/;
  const emailRegex = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid Email Address", 400);
  }

  if (aadharNo && !/^\d{12}$/.test(String(aadharNo))) {
    throw new AppError("Please enter valid Aadhar No", 400);
  }

  // Service 60 / 62 requires Sector + Village
  if ([60, 62].includes(Number(serviceId))) {
    if (!sectorId || Number(sectorId) === 0) {
      throw new AppError("Valid Sector is required", 400);
    }

    if (!villageId || Number(villageId) === 0) {
      throw new AppError("Valid Village is required", 400);
    }
  } else {
    if (!zoneId || Number(zoneId) === 0) {
      throw new AppError("Valid Prabhag is required", 400);
    }
  }

  const result = await service.saveServiceApplicationService({
    ulbId,
    userId,
    serviceId,
    applicationName: applicationName.trim(),
    address: address?.trim() || "",
    mobile,
    email: email.trim(),
    aadharNo: aadharNo || 0,
    refNo: refNo || "",
    zoneId: [60, 62].includes(Number(serviceId)) ? 12 : zoneId,
    sectorId: [60, 62].includes(Number(serviceId)) ? sectorId : 0,
    villageId: [60, 62].includes(Number(serviceId)) ? villageId : 0,
    locality: locality || "",
    landmark: landmark || "",
    pincode: pincode || 0,
    source: source || "WEB",
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
});

// ============================================================
// UPLOAD DOCUMENT
// ============================================================
const uploadServiceDocuments = asyncHandler(async (req, res) => {
  console.log("================================================");
  console.log("Request: Upload Service Documents");
  console.log("================================================");

  const { corpid, serviceId, appNo, documentIds } = req.body;

  console.log("Body:", req.body);

  console.log(
    "Files:",
    req.files?.map((file) => ({
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    })),
  );

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  if (!corpid) {
    throw new AppError("corpid is required", 400);
  }

  if (!serviceId) {
    throw new AppError("serviceId is required", 400);
  }

  if (!appNo) {
    throw new AppError("appNo is required", 400);
  }

  if (!documentIds) {
    throw new AppError("documentIds is required", 400);
  }

  if (!req.files || req.files.length === 0) {
    throw new AppError("Please upload at least one document.", 400);
  }

  // ----------------------------------------------------------
  // Convert documentIds
  // ----------------------------------------------------------

  const ids = String(documentIds)
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length !== req.files.length) {
    throw new AppError("Number of documentIds and uploaded files must be same.", 400);
  }

  // ----------------------------------------------------------
  // Validate maximum 5 MB + extension
  // ----------------------------------------------------------

  const allowedExtensions = [".PDF", ".JPG", ".JPEG", ".PNG"];

  const documents = req.files.map((file, index) => {
    const extension = path.extname(file.originalname).toUpperCase();

    if (!allowedExtensions.includes(extension)) {
      throw new AppError("Document should be acceptable in JPEG/JPG/PNG/PDF format only.", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new AppError("Document Size Should Be <5 MB", 400);
    }

    // Oracle column allows only 4 characters
    const docType = extension.substring(1);

    return {
      documentId: Number(ids[index]),
      docType,
      buffer: file.buffer,
      fileName: file.originalname,
    };
  });

  console.log(
    "Documents to Upload:",
    documents.map((doc) => ({
      documentId: doc.documentId,
      docType: doc.docType,
      fileName: doc.fileName,
      size: doc.buffer.length,
    })),
  );

  // ----------------------------------------------------------
  // Upload
  // ----------------------------------------------------------

  const result = await service.uploadServiceDocumentsService({
    corpid: Number(corpid),
    serviceId: Number(serviceId),
    appNo,
    documents,
  });

  if (!result || result.status !== "SUCCESS") {
    throw new AppError(result?.message || "Document upload failed.", 500);
  }

  return ok(res, {
    message: result.message,
    applicationNo: appNo,
    serviceId: Number(serviceId),
    documentCount: result.documentCount,
    documents: result.documents,
  });
});

// ============================================================
// GET VILLAGE LIST BY SECTOR
// ============================================================
const getVillageList = asyncHandler(async (req, res) => {
  console.log("================================================");
  console.log("Request: Get Village List");
  console.log("Request Body:", req.body);
  console.log("================================================");

  const { sectorId } = req.body;

  if (!sectorId) {
    throw new AppError("sectorId is required", 400);
  }

  const result = await service.getVillageListService(sectorId);

  return ok(res, {
    message: result.message,
    data: result.data,
  });
});


module.exports = {
  getWardList,
  getSectorList,
  getDocumentList,
  saveServiceApplication,
  uploadServiceDocuments,
  getVillageList,
};
