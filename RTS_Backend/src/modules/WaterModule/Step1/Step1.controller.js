const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./Step1.service");

// ---------------------------------------------------------------------------
// ONE unified document upload endpoint
// Expects: corpId, serviceId, appNo, docType, documentId, ulbId, userId
//         + file field "document"
// ---------------------------------------------------------------------------
exports.uploadDocument = asyncHandler(async (req, res) => {
  const { corpId, serviceId, appNo, docType, documentId, ulbId, userId } = req.body;
  const fileBuffer = req.file?.buffer;

  if (!corpId) return fail(res, "Corp ID is required");
  if (!serviceId) return fail(res, "Service ID is required");
  if (!appNo) return fail(res, "Application Number is required");
  if (!docType) return fail(res, "Document Type is required");
  if (!documentId) return fail(res, "Document ID is required");
  if (!ulbId) return fail(res, "ULB ID is required");
  if (!userId) return fail(res, "User ID is required");
  if (!fileBuffer) return fail(res, "Document file is required");

  const result = await service.uploadDocumentService({
    corpId,
    serviceId,
    appNo,
    docType,
    documentId,
    ulbId,
    userId,
    fileBuffer,
  });

  if (!result.success) {
    return fail(res, result.message || "Document upload failed");
  }

  return ok(res, result, result.message || "Document uploaded successfully");
});

// ---------------------------------------------------------------------------
// Procedure endpoint (unchanged, separate)
// ---------------------------------------------------------------------------
exports.callApplicationIns = asyncHandler(async (req, res) => {
  const {
    ulbId,
    corpid,
    serviceid,
    zoneid,
    userid,
    noofcopy,
    appno,
    marriageDate,
    mode,
  } = req.body;

  if (!ulbId) return fail(res, "ULB ID is required");
  if (!corpid) return fail(res, "Corp ID is required");
  if (!serviceid) return fail(res, "Service ID is required");
  if (!userid) return fail(res, "User ID is required");
  if (!mode) return fail(res, "Mode is required");

  const result = await service.callApplicationInsService({
    ulbId,
    corpid,
    serviceid,
    zoneid,
    userid,
    noofcopy,
    appno,
    marriageDate,
    mode,
  });

  if (!result.success) {
    return fail(res, result.message || "Application insert procedure failed");
  }

  return ok(res, result, "Application insert procedure executed successfully");
});