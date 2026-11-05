const asyncHandler = require("../../../libs/asyncHandler");
const { ok, fail } = require("../../../libs/response");
const service = require("./FrmNewTaxRecoveryReg.service");

exports.getWardList = asyncHandler(async (req, res) => {
  const ulbID = req.body.ulbID || req.user?.ulbID;

  if (!ulbID) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getWardListService(ulbID);

  return ok(res, result, "Ward list fetched successfully");
});

// 2. Get Usage Type
exports.getUsageTypeList = asyncHandler(async (req, res) => {
  const result = await service.getUsageTypeListService();

  return ok(res, result, "Usage type list fetched successfully");
});

// 3. Get Construction Type
exports.getConstructionTypeList = asyncHandler(async (req, res) => {
  const result = await service.getConstructionTypeListService();

  return ok(res, result, "Construction type list fetched successfully");
});

// 4. Get User Mobile Number
exports.getUserMobileNumber = asyncHandler(async (req, res) => {
  const userUniqueId = req.body.userUniqueId || req.user?.userUniqueId;

  const ulbID = req.body.ulbID || req.user?.ulbID;

  if (!userUniqueId) {
    return fail(res, "User Unique ID is required");
  }

  if (!ulbID) {
    return fail(res, "ULB ID is required");
  }

  const result = await service.getUserMobileNumberService(userUniqueId, ulbID);

  return ok(res, result, "User mobile number fetched successfully");
});

// 5. Get Water Sewerage Type
exports.getWaterSewerageTypeList = asyncHandler(async (req, res) => {
  const serviceId = req.body.serviceId || req.user?.serviceId;

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  const result = await service.getWaterSewerageTypeListService(serviceId);

  return ok(res, result, "Water sewerage type list fetched successfully");
});

// 6. Get NOC Purpose
exports.getNOCPurposeList = asyncHandler(async (req, res) => {
  const serviceId = req.body.serviceId || req.user?.serviceId;

  if (!serviceId) {
    return fail(res, "Service ID is required");
  }

  const result = await service.getNOCPurposeListService(serviceId);

  return ok(res, result, "NOC purpose list fetched successfully");
});

exports.getPrefilledApplicantDetails = asyncHandler(async (req, res) => {
  const { corpId, serviceId, userId, ulbID, appNo } = req.body;

  if (!corpId) return fail(res, "Corporation ID is required");
  if (!serviceId) return fail(res, "Service ID is required");
  if (!userId) return fail(res, "User ID is required");
  if (!ulbID) return fail(res, "ULB ID is required");

  const result = await service.getPrefilledApplicantDetailsService({
    corpId,
    serviceId,
    userId,
    ulbID,
    appNo: appNo || "",
  });

  return ok(res, result, result.message || "Applicant details fetched successfully");
});

const PROPERTY_SEARCH_ULB_IDS = [];

const emailRegex = /^([\w.-]+)@([\w-]+)((\.(\w){2,3})+)$/;

exports.insertNewTaxApplication = asyncHandler(async (req, res) => {
  const {
    ulbID,
    corpId,
    serviceId,
    userId,

    firstName,
    firstNameM,
    middleName,
    middleNameM,
    lastName,
    lastNameM,

    mobileNo,
    aadharNo,
    email,
    address,
    addressM,
    purpose,
    purposeM,

    zoneId,
    wardNo,
    propertyNo,
    mode,
    propertyUsage,
    sellerName,
    transferToWhom,
    agreementDate,
    appNo,

    wtsewrgtypeid,
    nocpurposeid,

    bndRecords,

    approved,

    mahaULBID,
    chatbot,

    propFlag,
    wardId,
    usageId,
    constId,
    propArea,
    owner,
    propAddress,
  } = req.body;

  // Basic required values
  if (!ulbID) return fail(res, "ULB ID is required");
  if (!corpId) return fail(res, "Corporation ID is required");
  if (!serviceId) return fail(res, "Service ID is required");
  if (!userId) return fail(res, "User ID is required");

  const isPropertySearch = PROPERTY_SEARCH_ULB_IDS.includes(String(ulbID));

  // Property Search ULB conditions
  if (isPropertySearch) {
    if (!wardId || String(wardId) === "0") {
      return fail(res, "Select valid Ward from the list");
    }

    if (!usageId || String(usageId) === "0") {
      return fail(res, "Select valid Usage Type from the list");
    }

    if (!constId || String(constId) === "0") {
      return fail(res, "Select valid Construction Type from the list");
    }

    if (propArea === undefined || propArea === null || String(propArea) === "") {
      return fail(res, "Property Area can not be blank");
    }

    if (!owner) {
      return fail(res, "Property Owner can not be blank");
    }

    if (!propAddress) {
      return fail(res, "Property Address can not be blank");
    }
  } else {
    // Property Number condition
    if (!["133", "49"].includes(String(serviceId)) && (!propertyNo || String(propertyNo).trim() === "")) {
      return fail(res, "Please Enter Property No");
    }
  }

  // Zone
  if (!zoneId || String(zoneId) === "0") {
    return fail(res, "Select valid Zone from the list");
  }

  // English Name
  if (!firstName) return fail(res, "First Name can not be blank");
  if (!middleName) return fail(res, "Middle Name can not be blank");
  if (!lastName) return fail(res, "Last Name can not be blank");

  // Marathi Name
  if (!firstNameM) {
    return fail(res, "First Name in Marathi can not be blank");
  }

  if (!middleNameM) {
    return fail(res, "Middle Name in Marathi can not be blank");
  }

  if (!lastNameM) {
    return fail(res, "Last Name in Marathi can not be blank");
  }

  // Mobile Number
  if (mobileNo && String(mobileNo).length !== 10) {
    return fail(res, "Invalid Mobile No.");
  }

  // Email
  if (!email) {
    return fail(res, "Email can not be blank");
  }

  if (!emailRegex.test(String(email).trim())) {
    return fail(res, "Invalid Email Address");
  }

  // Address
  if (!address) return fail(res, "Address can not be blank");

  if (!addressM) {
    return fail(res, "Address in Marathi can not be blank");
  }

  // Purpose
  if (!purpose) return fail(res, "Purpose can not be blank");

  if (!purposeM) {
    return fail(res, "Purpose in Marathi can not be blank");
  }

  // Service ID = 16 : Water Sewerage Type
  if (String(serviceId) === "16") {
    if (!wtsewrgtypeid || String(wtsewrgtypeid) === "0") {
      return fail(res, "Select Water sewarage type from the list");
    }
  }

  // Service ID = 12 : Fire NOC Purpose
  if (String(serviceId) === "12") {
    if (!nocpurposeid || String(nocpurposeid) === "0") {
      return fail(res, "Select NOC Purpose");
    }
  }

  // Service ID = 14 or 15 : Birth / Death
  if (["14", "15"].includes(String(serviceId))) {
    const selectedRecords = Array.isArray(bndRecords) ? bndRecords.filter((item) => item.selected === true) : [];

    if (selectedRecords.length === 0) {
      return fail(res, "Select Atleast one Record");
    }
  }

  // Approve checkbox
  if (approved !== true) {
    return fail(res, "Please Accept the Condition");
  }

  // Validate Agreement Date if provided
  if (agreementDate && isNaN(Date.parse(agreementDate))) {
    return fail(res, "Invalid Agreement Date");
  }

  const result = await service.insertNewTaxApplicationService({
    ulbID,
    corpId,
    serviceId,
    userId,

    firstName,
    firstNameM,
    middleName,
    middleNameM,
    lastName,
    lastNameM,

    mobileNo,
    aadharNo,
    email,
    address,
    addressM,
    purpose,
    purposeM,

    zoneId,
    wardNo,
    propertyNo,
    mode: mode || 1,
    propertyUsage,
    sellerName,
    transferToWhom,
    agreementDate,
    appNo,

    wtsewrgtypeid,
    nocpurposeid,

    bndRecords: bndRecords || [],

    mahaULBID,
    chatbot,

    propertySearch: isPropertySearch,
    propFlag,
    wardId,
    usageId,
    constId,
    propArea,
    owner,
    propAddress,
  });

  if (!result.success) {
    return fail(res, result.message || "Application submission failed");
  }

  return ok(res, result, result.message || "Application submitted successfully");
});

exports.insertKarjatModule = asyncHandler(async (req, res) => {
  try {
    const result = await service.insertKarjatModuleService(req.body);

    return ok(res, result, "Karjat module application inserted successfully");
  } catch (error) {
    return fail(res, error.message || "Karjat module insertion failed");
  }
});

exports.getCorporationCode = asyncHandler(async (req, res) => {
  const result = await service.getCorporationCodeService(req.body);

  return ok(res, result, "Corporation code fetched successfully");
});

exports.getAMCNoDuesDetails = asyncHandler(async (req, res) => {
  const result = await service.getAMCNoDuesDetailsService(req.body);

  return ok(res, result, "AMC No-Dues application details fetched successfully");
});

exports.searchBNDRecords = asyncHandler(async (req, res) => {
  const result = await service.searchBNDRecordsService(req.body);

  return ok(res, result, "Birth and Death records fetched successfully");
});
