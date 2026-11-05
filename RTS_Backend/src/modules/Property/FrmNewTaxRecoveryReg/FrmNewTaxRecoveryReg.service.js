const repo = require("./FrmNewTaxRecoveryReg.repo");
const { AppError } = require("../../../libs/errors");

async function getNOCPurposeListService(serviceId) {
  if (String(serviceId) !== "12") {
    return {
      success: true,
      rowCount: 0,
      rows: [],
    };
  }

  const result = await repo.getNOCPurposeList();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getWardListService(ulbID) {
  const result = await repo.getWardList(ulbID);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

// 2. Usage Type
async function getUsageTypeListService() {
  const result = await repo.getUsageTypeList();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

// 3. Construction Type
async function getConstructionTypeListService() {
  const result = await repo.getConstructionTypeList();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

// 4. User Mobile Number
async function getUserMobileNumberService(userUniqueId, ulbID) {
  const result = await repo.getUserMobileNumber(userUniqueId, ulbID);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    mobileNumber: result.rows.length > 0 ? result.rows[0].NUM_USER_MOBILENO : null,
    rows: result.rows,
  };
}

// 5. Water Sewerage Type
async function getWaterSewerageTypeListService(serviceId) {
  if (String(serviceId) !== "16") {
    return {
      success: true,
      rowCount: 0,
      rows: [],
    };
  }

  const result = await repo.getWaterSewerageTypeList();

  if (!result.success) {
    throw new AppError(result.error, 500);
  }

  return {
    success: true,
    rowCount: result.rows.length,
    rows: result.rows,
  };
}

async function getPrefilledApplicantDetailsService(params) {
  const result = await repo.getPrefilledApplicantDetails(params);

  if (!result.success) {
    throw new AppError(result.error, 500);
  }
  console.log("result :", result);
  // Default Mode = 1
  if (!result.rows || result.rows.length === 0) {
    return {
      success: true,
      Mode: 1,
      rowCount: 0,
      applicantDetails: null,
      message: "No existing applicant details found",
    };
  }

  const row = result.rows[0];

  return {
    success: true,
    Mode: 2,
    rowCount: result.rows.length,

    applicantDetails: {
      applId: row.NUM_APPL_ID,
      corpId: row.NUM_APPL_CORPID,
      serviceId: row.NUM_APPL_SERVICEID,
      appNo: row.VAR_APPL_APPNOTEMP,
      userId: row.VAR_APPL_USERID,

      firstName: row.VAR_APPL_FIRSTNAME,
      middleName: row.VAR_APPL_MIDDLENAME,
      lastName: row.VAR_APPL_LASTNAME,

      firstNameM: row.VAR_APPL_MFIRSTNAME,
      middleNameM: row.VAR_APPL_MMIDDLENAME,
      lastNameM: row.VAR_APPL_MLASTNAME,

      mobileNo: row.VAR_APPL_MOBNO,
      aadharNo: row.VAR_APPL_AADHARNO,
      email: row.VAR_APPL_EMAIL,

      address: row.VAR_APPL_ADDRESS,
      addressM: row.VAR_APPL_MADDRESS,

      purpose: row.VAR_APPL_PURPOSE,
      purposeM: row.VAR_APPL_MPURPOSE,

      uniqueNo: row.VAR_APPLICANT_UIQUENO,
      applicationDate: row.DAT_APPLICATION_INSDATE,

      zoneId: row.NUM_APPLICATION_ZONEID,
      wardNo: row.NUM_APPLICATION_WARDNO,

      propertyNo: row.VAR_APPLICATION_PROPERTYNO,
      propertyUsage: row.PROPERTYUSAGE,

      sellerName: row.SELLERNAME,
      transferToWhom: row.TRANSFERTOWHOM,
      agreementDate: row.AGREEMENTDATE,

      waterSewerageTypeId: row.NUM_APPLICANT_WTSEWRGTYPEID,
      nocPurposeId: row.NUM_APPLICANT_FIRENOCPURPOSEID,
      certificateType: row.VAR_BDOTHER_CERTISSUETYPE,
    },
  };
}

async function insertNewTaxApplicationService(payload) {
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
    bndRecords = [],
    mahaULBID,
    chatbot,
    propertySearch,
    propFlag,
    wardId,
    usageId,
    constId,
    propArea,
    owner,
    propAddress,
  } = payload;

  // BND registration details
  let regiNo = null;
  let uniqueNo = null;

  if (["14", "15"].includes(String(serviceId))) {
    // Original C# loop retains the last selected record
    const selectedRecords = bndRecords.filter((item) => item.selected === true);

    if (selectedRecords.length > 0) {
      const selected = selectedRecords[selectedRecords.length - 1];

      regiNo = selected.registrationNo;
      uniqueNo = selected.uniqueNo;
    }
  }

  // Service ID based values
  const waterSewerageTypeId = String(serviceId) === "16" ? wtsewrgtypeid : null;

  const nocPurposeId = String(serviceId) === "12" ? nocpurposeid : null;

  // Application Source
  let appSource = "WEB";

  if (mahaULBID !== null && mahaULBID !== undefined && String(mahaULBID).trim() !== "") {
    appSource = "MAHA";
  } else if (chatbot !== null && chatbot !== undefined && String(chatbot).trim() !== "") {
    appSource = "CBOT";
  }

  const propertySearchULBIds = (process.env.PROPSEARCH_ULB_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const isPropertySearchULB = propertySearchULBIds.includes(String(payload.ulbID));

  // Old property details
  let oldstr = "";

  if (isPropertySearchULB) {
    if (String(payload.propFlag) === "N") {
      oldstr = [payload.wardId, payload.usageId, payload.constId, payload.propArea, payload.owner, payload.propAddress].join("$");
    }
  }

  const result = await repo.insertNewTaxApplication({
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

    mobileNo: mobileNo || null,
    aadharNo: aadharNo || null,
    email,
    address,
    addressM,
    purpose,
    purposeM,

    zoneId: zoneId || null,
    wardNo: wardNo || null,
    propertyNo: propertyNo || null,

    mode: mode || 1,
    propertyUsage: propertyUsage || null,
    sellerName: sellerName || null,
    transferToWhom: transferToWhom || null,
    agreementDate: agreementDate || null,
    appNo: appNo || null,

    wtsewrgtypeid: waterSewerageTypeId || null,
    nocpurposeid: nocPurposeId || null,

    regiNo,
    uniqueNo,
    appSource,
    deliveryFlag: null,
    oldstr,
  });

  const errorCode = Number(result.out_errcode);
  const errorMessage = result.out_ErrMsg || "";
  const applicationNo = result.out_AppNo || "";

  if (errorCode !== 9999) {
    return {
      success: false,
      errorCode,
      message: errorMessage,
      applicationNo: null,
    };
  }

  return {
    success: true,
    errorCode,
    message: errorMessage,
    applicationNo,
  };
}

const KARJAT_ULB_IDS = ["1890", "1150"];

const KARJAT_SERVICE_IDS = ["5", "44", "45", "46", "48", "49", "51", "52", "58", "61", "133"];

async function insertKarjatModuleService(payload) {
  const ulbID = String(payload.ulbID);
  const serviceId = String(payload.serviceId);

  // Same ULB and Service condition as .NET
  if (!KARJAT_ULB_IDS.includes(ulbID) || !KARJAT_SERVICE_IDS.includes(serviceId)) {
    throw new AppError("Karjat module is not applicable for this ULB or service", 400);
  }

  const values = [
    payload.corpId, // 1
    payload.serviceId, // 2
    payload.appNo, // 3
    payload.userId, // 4
    payload.firstName, // 5
    payload.firstNameM, // 6
    payload.middleName, // 7
    payload.middleNameM, // 8
    payload.lastName, // 9
    payload.lastNameM, // 10
    payload.mobileNo, // 11
    payload.aadharNo, // 12
    payload.email, // 13
    payload.address, // 14
    payload.addressM, // 15
    payload.purpose, // 16
    payload.purposeM, // 17
    payload.zoneId, // 18
    payload.wardNo, // 19
    payload.propertyNo, // 20
    payload.propertyUsage, // 21
    payload.sellerName, // 22
    payload.transferToWhom, // 23
    "", // 24 Agreement Date
    payload.appNo, // 25 AppNo
    payload.wtsewrgtypeid, // 26
    payload.nocpurposeid, // 27
    payload.regiNo, // 28 BND Registration No
    payload.uniqueNo, // 29 BND Unique No
    payload.ulbID, // 30
    payload.appSource, // 31
    "N", // 32 Delivery Status
  ];

  // Preserve the original .NET string.Join("~", object[]) behaviour.
  const requeststr = values.map((value) => (value === null || value === undefined ? "" : String(value))).join("~");

  const requestdtlsstr = "";

  const result = await repo.insertKarjatModule({
    userId: payload.userId,
    flag: "AppliEntry",
    requeststr,
    requestdtlsstr,
  });

  const errorCode = Number(result.out_ErrorCode);

  if (errorCode !== 9999) {
    throw new AppError(result.out_ErrorMsg || "Karjat module application insertion failed", 400);
  }

  return {
    errorCode,
    errorMsg: result.out_ErrorMsg,
    outStr: result.out_str,
  };
}

async function getCorporationCodeService(payload) {
  const { ulbID } = payload;

  if (!ulbID) {
    throw new AppError("ULB ID is required", 400);
  }

  const result = await repo.getCorporationCode(ulbID);

  if (result?.success === false) {
    throw new AppError(result.error || "Failed to fetch corporation code", 500);
  }

  const rows = result?.rows || result;

  return {
    success: true,
    corporationCode: rows?.[0]?.CORPORATION_CODE || rows?.[0]?.corporation_code || "",
  };
}

async function getAMCNoDuesDetailsService(payload) {
  const { appNo, payAmount, ulbID, serviceId } = payload;

  if (!appNo) {
    throw new AppError("Application number is required", 400);
  }

  if (ulbID === undefined || ulbID === null || ulbID === "") {
    throw new AppError("ULB ID is required", 400);
  }

  if (payAmount === undefined || payAmount === null || payAmount === "") {
    throw new AppError("Payment amount is required", 400);
  }

  if (serviceId === undefined || serviceId === null || serviceId === "") {
    throw new AppError("Service ID is required", 400);
  }

  // Step 1: Get corporation code
  const corpResult = await repo.getCorporationCode(ulbID);

  if (corpResult?.success === false) {
    throw new AppError(corpResult.error || "Failed to fetch corporation code", 500);
  }

  const corpRows = Array.isArray(corpResult) ? corpResult : corpResult?.rows || corpResult?.data || [];

  const corporationCode = corpRows?.[0]?.CORPORATION_CODE || corpRows?.[0]?.corporation_code || "";

  // Step 2: Continue only for AMC
  if (corporationCode !== "AMC") {
    return {
      success: true,
      corporationCode,
      found: false,
      message: "Corporation code is not AMC",
    };
  }

  // Step 3: Update No-Dues amount
  const updateResult = await repo.updateAMCNoDuesAmount({
    appNo,
    payAmount,
    ulbID,
  });

  if (updateResult?.success === false) {
    throw new AppError(updateResult.error || "Failed to update No-Dues amount", 500);
  }

  // Step 4: Fetch application details
  const queryResult = await repo.getAMCNoDuesApplicationDetails({
    appNo,
    serviceId,
    ulbID,
  });

  if (queryResult?.success === false) {
    throw new AppError(queryResult.error || "Failed to fetch application details", 500);
  }

  const rows = Array.isArray(queryResult) ? queryResult : queryResult?.rows || queryResult?.data || [];

  return {
    success: true,
    corporationCode,
    found: rows.length > 0,
    data: rows,
  };
}

async function searchBNDRecordsService(payload) {
  const { serviceId, registrationNo, bndDate, fatherName, motherName } = payload;

  if (!["14", "15"].includes(String(serviceId))) {
    throw new AppError("Invalid Service ID. Only 14 and 15 are allowed.", 400);
  }

  const hasSearchCriteria = String(registrationNo ?? "").trim() !== "" || String(bndDate ?? "").trim() !== "" || String(fatherName ?? "").trim() !== "" || String(motherName ?? "").trim() !== "";

  if (!hasSearchCriteria) {
    throw new AppError("Please Enter Reg.no OR Date OR Father Name OR Mother Name", 400);
  }

  // Convert date to YYYY-MM-DD for Oracle TO_DATE
  let formattedDate = null;

  if (bndDate) {
    const dateValue = String(bndDate).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      formattedDate = dateValue;
    } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
      const [day, month, year] = dateValue.split("/");
      formattedDate = `${year}-${month}-${day}`;
    } else {
      throw new AppError("Invalid date format. Use YYYY-MM-DD or DD/MM/YYYY.", 400);
    }
  }

  const result = await repo.searchBNDRecords({
    serviceId: Number(serviceId),
    registrationNo: String(registrationNo ?? "").trim() || null,
    bndDate: formattedDate,
    fatherName: String(fatherName ?? "").trim() || null,
    motherName: String(motherName ?? "").trim() || null,
  });

  if (result?.success === false) {
    throw new AppError(result.error || "Failed to search BND records", 500);
  }

  const rows = Array.isArray(result) ? result : result?.rows || result?.data || [];

  return {
    success: true,
    serviceId: Number(serviceId),
    header: Number(serviceId) === 15 ? "Death Details :" : "Birth Details :",
    totalRecords: rows.length,
    data: rows,
  };
}

module.exports = {
  getWardListService,
  getUsageTypeListService,
  getConstructionTypeListService,
  getUserMobileNumberService,
  getWaterSewerageTypeListService,
  getNOCPurposeListService,
  getPrefilledApplicantDetailsService,
  insertNewTaxApplicationService,
  insertKarjatModuleService,
  getCorporationCodeService,
  getAMCNoDuesDetailsService,
  searchBNDRecordsService
};
