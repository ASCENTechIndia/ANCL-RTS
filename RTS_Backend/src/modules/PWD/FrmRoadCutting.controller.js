const asyncHandler = require("../../libs/asyncHandler");
const { ok } = require("../../libs/response");
const { AppError } = require("../../libs/errors");

const service = require("./FrmRoadCutting.service");


const getRoadTypeList = asyncHandler(async (req, res) => {


  const result = await service.getRoadTypeListService();

  return ok(res, {
    message: result.message,
    data: result.data,
  });
});


const getWardList = asyncHandler(async (req, res) => {
  console.log("Request: Get Ward List");
  console.log("Request Query:", req.query);

  const { ulbid } = req.query;

  if (!ulbid) {
    throw new AppError("ULB ID is required.", 400);
  }

  const result = await service.getWardListService(ulbid);

  return ok(res, {
    message: result.message,
    data: result.data,
  });
});

const getRoadCuttingTypeList = asyncHandler(async (req, res) => {
  console.log("Request: Get Road Cutting Type List");
  console.log("Request Query:", req.query);

  const { ulbid } = req.query;

  if (!ulbid) {
    throw new AppError("ULB ID is required.", 400);
  }

  const result = await service.getRoadCuttingTypeListService(ulbid);

  return ok(res, {
    message: result.message,
    data: result.data,
  });
});


const getPrabhagSamitiList = asyncHandler(async (req, res) => {
  console.log("Request: Get Prabhag Samiti List");
  console.log("Request Query:", req.query);

  const { ulbid } = req.query;

  if (!ulbid) {
    throw new AppError("ULB ID is required.", 400);
  }

  const result = await service.getPrabhagSamitiListService(ulbid);

  return ok(res, {
    message: result.message,
    data: result.data,
  });
});

const saveRoadCutting = asyncHandler(async (req, res) => {

  const {
    userId,
    serviceId,
    roadCuttingId,
    ulbId,
    appliFName,
    appliMName,
    appliLName,
    mobile,
    email,
    aadharNo,
    propNo,
    resNo,
    roadType,
    roadLength,
    roadWidth,
    roadLengthWidth,
    excavationSize,
    excavationStart,
    excavationEnd,
    latitude,
    longitude,
    zoneId,
    source,
    prabhagId,
    roadCutTypeId,
    roadCutReason,
    vcStartPoint,
    vcEndPoint,
  } = req.body;

  if (!userId) {
    throw new AppError("User ID is required.", 400);
  }

  if (!ulbId) {
    throw new AppError("ULB ID is required.", 400);
  }

  if (!serviceId) {
    throw new AppError("Service ID is required.", 400);
  }

  if (!appliFName || !String(appliFName).trim()) {
    throw new AppError("First Name is required.", 400);
  }

  if (!appliMName || !String(appliMName).trim()) {
    throw new AppError("Middle Name is required.", 400);
  }

  if (!appliLName || !String(appliLName).trim()) {
    throw new AppError("Last Name is required.", 400);
  }

  if (!mobile) {
    throw new AppError("Mobile Number is required.", 400);
  }

  if (!/^\d{10}$/.test(String(mobile))) {
    throw new AppError("Invalid Mobile Number.", 400);
  }

  if (!aadharNo) {
    throw new AppError("Aadhar Number is required.", 400);
  }

  if (!/^\d{12}$/.test(String(aadharNo))) {
    throw new AppError("Invalid Aadhar Number.", 400);
  }

  if (!roadType || Number(roadType) <= 0) {
    throw new AppError("Road Type is required.", 400);
  }

  if (!roadLength || Number(roadLength) <= 0) {
    throw new AppError("Valid Road Length is required.", 400);
  }

  if (!roadWidth || Number(roadWidth) <= 0) {
    throw new AppError("Valid Road Width is required.", 400);
  }

  if (!excavationSize || Number(excavationSize) <= 0) {
    throw new AppError("Valid Excavation Size is required.", 400);
  }

  if (latitude === undefined || latitude === null || latitude === "") {
    throw new AppError("Latitude is required.", 400);
  }

  if (longitude === undefined || longitude === null || longitude === "") {
    throw new AppError("Longitude is required.", 400);
  }

  const calculatedRoadLengthWidth =
    roadLengthWidth !== undefined &&
    roadLengthWidth !== null &&
    roadLengthWidth !== ""
      ? Number(roadLengthWidth)
      : Number(roadLength) * Number(roadWidth);

  const result = await service.saveRoadCuttingService({
    userId: String(userId),
    serviceId: Number(serviceId),
    roadCuttingId: Number(roadCuttingId || 0),
    ulbId: Number(ulbId),

    appliFName: String(appliFName).trim(),
    appliMName: String(appliMName).trim(),
    appliLName: String(appliLName).trim(),

    mobile: String(mobile),
    email: email ? String(email).trim() : "",
    aadharNo: String(aadharNo),

    propNo: propNo ? String(propNo).trim() : "",
    resNo: resNo ? String(resNo).trim() : "",

    roadType: Number(roadType),
    roadLength: Number(roadLength),
    roadWidth: Number(roadWidth),
    roadLengthWidth: calculatedRoadLengthWidth,

    excavationSize: Number(excavationSize),
    excavationStart: Number(excavationStart || 0),
    excavationEnd: Number(excavationEnd || 0),

    latitude: Number(latitude),
    longitude: Number(longitude),

    zoneId: Number(zoneId || 0),
    source: source || "WEB",
        prabhagId:
    prabhagId !== undefined && prabhagId !== null && prabhagId !== ""
        ? Number(prabhagId)
        : null,
    roadCutTypeId:
      roadCutTypeId !== undefined && roadCutTypeId !== null && roadCutTypeId !== ""
        ? Number(roadCutTypeId)
        : null,
    roadCutReason:
      roadCutReason && String(roadCutReason).trim() !== ""
        ? String(roadCutReason).trim()
        : null,
    vcStartPoint:
      vcStartPoint !== undefined && vcStartPoint !== null && vcStartPoint !== ""
        ? String(vcStartPoint)
        : null,
    vcEndPoint:
      vcEndPoint !== undefined && vcEndPoint !== null && vcEndPoint !== ""
        ? String(vcEndPoint)
        : null,
  });

  console.log("Road Cutting Save Service Result:", result);

  if (!result.success) {
    throw new AppError(
      result.message || "Road Cutting application insertion failed.",
      400,
    );
  }

  return ok(res, {
    message: result.message,
    applicationNo: result.applicationNo,
    errCode: result.errCode,
  });
});

module.exports = {
  getRoadTypeList,
  getWardList,
  getRoadCuttingTypeList,
  getPrabhagSamitiList,
  saveRoadCutting,
};
